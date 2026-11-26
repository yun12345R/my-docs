# 实践课 5：Pi Agent 源码泛读与功能定位

本次实验在小组源码仓库 `pi-hunnu-2026` 根目录进行，使用本地编译的 Pi（`v1.5.2`，`node .\packages\coding-agent\dist\cli.js`）和 `deepseek-v4-pro` 模型。

## A. 单轮交互与工具调用

我在项目根目录创建了 `handoff.txt`，把示例标识替换成随机生成的 `sad-582`：

```text
待办：补充 README 的启动说明
启动命令：npm run demo -- --profile sad-582
```

启动本地构建的 Pi 后，在新会话输入：

> 请用 read 工具读取当前目录的 handoff.txt，原样告诉我待办和启动命令。

这一轮交互实际发生了 **2 次模型请求**和 **1 次 `read` 工具调用**：第 1 次模型请求返回 `toolUse`，调用 `read` 读取 `handoff.txt`；工具结果写入上下文后发起第 2 次模型请求，Pi 给出最终回复：

> handoff.txt 原样内容如下：
> - 待办：补充 README 的启动说明
> - 启动命令：npm run demo -- --profile sad-582

### 图 1：单轮工具调用的代码级时序图

```mermaid
sequenceDiagram
    autonumber
    actor User as 用户
    participant UI as 交互与会话层<br/>(interactive-mode.ts / agent-session.ts)
    participant Agent as Agent 执行层<br/>(agent.ts / agent-loop.ts)
    participant LLM as 模型请求层<br/>(model-runtime.ts / openai-completions.ts)
    participant ReadTool as read 工具<br/>(core/tools/read.ts)

    User->>UI: 输入提问并回车
    Note over UI: interactive-mode.ts: defaultEditor.onSubmit(text)<br/>→ onInputCallback(text) 唤醒 run() 中的 getUserInput()
    UI->>UI: interactive-mode.ts → agent-session.ts:<br/>this.session.prompt(userInput) → _preparePrompt() → _startRun()
    UI->>Agent: this.agent.prompt(messages)

    Note over Agent: agent.ts: Agent.prompt()<br/>→ runPromptMessages() → runAgentLoop()
    Agent->>Agent: agent-loop.ts: runLoop() 第 1 轮<br/>streamAssistantResponse() → transformContext() → convertToLlm()

    Agent->>LLM: streamFunction(config.model, llmContext, options)
    LLM->>LLM: sdk.ts → model-runtime.ts: modelRuntime.streamSimple()<br/>→ openai-completions.ts: streamSimple() / stream()<br/>适配器请求远端模型: client.chat.completions.create(params).withResponse()
    LLM-->>LLM: 远端模型返回 SSE 响应 (stopReason="toolUse", toolCall: read)
    LLM-->>Agent: 返回带 read 工具调用的 AssistantMessage

    Agent->>Agent: agent-loop.ts: executeToolCalls()<br/>→ prepareToolCall() → validation.ts: validateToolArguments()
    Agent->>ReadTool: tool.execute(toolCallId, { path, offset, limit }, signal)

    ReadTool->>ReadTool: resolveReadPathAsync() → ops.access() (fsAccess)<br/>detectImageMimeType() → 非图片走文本分支<br/>isStreamableRange(offset, limit) === true<br/>→ selectLinesFromStream(ops.createReadStream())<br/>→ readLocalFileChunks(): fsOpen(path,"r") → handle.createReadStream()
    Note over ReadTool: 文本在流式范围内走流式读取；<br/>仅图片 / 无 createReadStream / 非流式范围时<br/>回退到 ops.readFile() (fsReadFile) 缓冲区读取

    ReadTool-->>Agent: 返回 handoff.txt 文本内容 (ToolResult)
    Agent->>Agent: currentContext.messages.push(toolResult)<br/>emit({ type: "turn_end", message, toolResults })

    Agent->>Agent: agent-loop.ts: runLoop() 第 2 轮<br/>hasMoreToolCalls = true → streamAssistantResponse()<br/>(上下文已追加 toolCall 与 toolResult)
    Agent->>LLM: streamFunction(config.model, llmContext, options)
    LLM->>LLM: openai-completions.ts: 适配器第 2 次请求远端模型<br/>client.chat.completions.create(params).withResponse()
    LLM-->>LLM: 远端模型返回 SSE 流式文本 (stopReason="stop")
    LLM-->>Agent: 产出文本增量事件与最终 AssistantMessage

    loop 流式回复到达
        Agent-->>UI: emit({ type: "message_update", message })
        Note over UI: interactive-mode.ts: subscribeToAgent() → handleEvent()<br/>case "message_update":<br/>streamingComponent.updateContent(streamingMessage, true)<br/>ui.requestRender()
    end

    Agent-->>UI: emit({ type: "message_end", message })
    Note over UI: interactive-mode.ts: handleEvent()<br/>case "message_end":<br/>streamingComponent.updateContent(streamingMessage, false)<br/>完成最终渲染并清理 streamingComponent
    UI-->>User: 终端显示最终回复
```

核对源码时的关键点：
- `read.ts` 的 `defaultReadOperations` 同时提供 `createReadStream`（`readLocalFileChunks`）和 `readFile`（`fsReadFile`）。这次调用虽然模型输出了 `offset: null, limit: null`，但在执行前经 `packages/ai/src/utils/validation.ts` 的 `validateToolArguments()` 清洗为省略（`undefined`），因此 `isStreamableRange(offset, limit)` 返回 `true`，**实际走的是流式读取**（`fsOpen` + `handle.createReadStream` + `selectLinesFromStream`）。只有读取图片、未提供 `createReadStream` 或传入非流式范围时，才会走 `fsReadFile` 整文件缓冲区读取。
- 界面输出在 `interactive-mode.ts` 的 `subscribeToAgent()` 订阅 `this.session.subscribe(...)`，进入 `handleEvent()` 的 `message_update`（流式刷新）和 `message_end`（定稿显示）分支。

---

## B. 恢复上次会话，继续写 README

A 阶段完成后退出 Pi，在同一项目目录、用同一个模型 `deepseek-v4-pro`，分别在“恢复旧会话”和“新建会话”两种情况下输入完全相同的话：

> 接着上次的待办，给 README 起草一条启动说明，写出交接单里的完整启动命令。只用这次会话已有的信息。不要调用工具。如果缺少命令，请直接说明。

### 1. 两次实测记录

1. **恢复原会话（`node .\packages\coding-agent\dist\cli.js -c`）**
   - 启动后终端里可以直接看到 A 阶段的对话和 `read` 记录，继续沿用同一个 `.jsonl` 会话文件。
   - **是否调用工具**：否（0 次工具调用，仅 1 次模型请求）。
   - **实际回答**：直接起草了 README 启动说明，并准确写出了完整启动命令 `npm run demo -- --profile sad-582`。

2. **新建会话（输入 `/new`）**
   - 界面提示 `✓ New session started`，创建了新的空 `.jsonl` 会话文件。
   - **是否调用工具**：否（0 次工具调用，仅 1 次模型请求）。
   - **实际回答**：
     > 这个会话里没有交接单的内容，也没有上次会话的待办记录。我拿不到交接单里的完整启动命令，因此无法起草 README 的启动说明。
     > 如果你把交接单里的启动命令贴过来，或者告诉我交接单的路径，我可以直接起草。

### 2. 图 2：恢复旧会话和新建会话的对照图

```mermaid
flowchart TD
    Start["A 阶段已经结束<br/>Pi 已通过 read 读到并回答了启动命令<br/>历史记录已写入本地 .jsonl 会话文件"]

    %% 左分支：恢复旧会话 (-c)
    Start --> C1["退出 Pi，加 -c 重新启动<br/>node .\packages\coding-agent\dist\cli.js -c"]
    C1 --> C2["打开 A 阶段保存的会话文件<br/>main.ts: parsed.continue 为 true<br/>→ SessionManager.continueRecent(cwd, sessionDir)"]
    C2 --> C3["从文件中恢复历史消息<br/>sdk.ts: existingSession = sessionManager.buildSessionContext()<br/>→ new Agent({ initialState: { messages: existingSession.messages } })"]
    C3 --> C4["用户输入：<br/>“接着上次的待办，给 README 起草一条启动说明……”"]
    C4 --> C5["Agent.prompt() → runAgentLoop() 请求模型<br/>发送消息 = system + A 阶段恢复的历史消息(含 sad-582) + 本次提问"]
    C5 --> C6["未调用工具，直接写出含 npm run demo -- --profile sad-582 的启动说明"]

    %% 右分支：新建会话 (/new)
    Start --> N1["输入 /new"]
    N1 --> N2["创建聊天历史为空的新会话<br/>interactive-mode.ts: onSubmit 命中 '/new' → handleClearCommand()<br/>→ agent-session-runtime.ts: newSession()<br/>→ SessionManager.create(cwd, sessionDir)"]
    N2 --> N3["重建空的 AgentSession / Agent<br/>buildSessionContext().messages 为空 []，仅保留新的 system 提示"]
    N3 --> N4["用户输入完全相同的提问：<br/>“接着上次的待办，给 README 起草一条启动说明……”"]
    N4 --> N5["Agent.prompt() → runAgentLoop() 请求模型<br/>发送消息 = 新 system + 本次提问（无 A 阶段读到的启动命令）"]
    N5 --> N6["未调用工具，回复当前会话缺少交接单和启动命令，无法起草"]
```
