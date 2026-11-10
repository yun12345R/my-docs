# Pi PPT Skill 实际生成记录

说明：以下保留Pi进程的原始回复。回复中的“未检测到”只指该进程的执行环境；后续已使用本机Microsoft PowerPoint实际打开并逐页检查两页，效果截图在项目images目录。

执行方式：Pi 1.5.0 JSON非交互模式，使用项目内 `/skill:pptx`。

生成要求：两页中文Pi Agent实践展示，依赖和临时文件在D盘。

I'll start by reading the full Skill instructions and checking the actual local dependencies.

依赖检查完成：`pptxgenjs` 本机缺失，已按限制安装到 `D:/Pi-Agent/pptx-runtime`；`defusedxml` 缺失，已安装到 `D:/Pi-Agent/pptx-python`。现在编写可复现生成脚本。

现在按 Skill 要求运行结构验证。

已完成并生成。

## 输出文件

| 文件 | 路径 |
|---|---|
| 演示文稿 | `E:\HuaweiMoveData\Users\22181\Desktop\开源软件作业\pi-agent\ppt-output\Pi-Agent-两页实践展示.pptx` |
| 可复现脚本 | `E:\HuaweiMoveData\Users\22181\Desktop\开源软件作业\pi-agent\ppt-output\generate.js` |

- 页数：**恰好 2 页**（第 1 页即封面，无额外页）
- 版面：**16:9，13.333 × 7.5 英寸**
- 字体：全部为“微软雅黑”；标题 40pt 深蓝 `1E2761`；正文 22/24pt；白底；纯文字可编辑，无图标、无装饰图形、无图片
- 页边距：左右 0.8 英寸，底边不小于 0.85 英寸
- 内容均取自本项目 README、hello.py 与截图，未添加虚构数据

## 本机依赖实际检查与处理（未把“预装”当作事实）

| 依赖 | 实际情况 | 处理 |
|---|---|---|
| Node / npm | v24.18.0 / 11.16.0 | 直接使用 |
| `pptxgenjs` | **require 失败，原先不存在** | 安装到 `D:/Pi-Agent/pptx-runtime`，缓存 `D:/npm-cache`，使用 `--ignore-scripts`（19 个包） |
| Python | 3.14.0；lxml 6.1.2、Pillow 12.1.0、python-pptx 1.0.2 已存在 | 未改动 |
| `defusedxml`（validate.py 需要） | **缺失** | 安装到 `D:/Pi-Agent/pptx-python`，缓存 `D:/pip-cache`，未改系统环境 |
| `markitdown` | 缺失 | 未安装；改用 python-pptx 导出全部文字做内容核对 |
| LibreOffice / pdftoppm | 未检测到 | 按指示不安装、不调用 GUI，因此未做图片化视觉 QA |

## 验证命令与真实结果

```powershell
cd "E:\HuaweiMoveData\Users\22181\Desktop\开源软件作业\pi-agent\.pi\skills\pptx"
$env:PYTHONUTF8=1
$env:PYTHONPATH="D:\Pi-Agent\pptx-python"
D:\python\python.exe scripts\office\validate.py "E:\HuaweiMoveData\Users\22181\Desktop\开源软件作业\pi-agent\ppt-output\Pi-Agent-两页实践展示.pptx"
```

第一次运行报 `'gbk' codec can't decode ...`：这是 Windows 默认 GBK 与 UTF-8 XML 冲突，不是文件缺陷；**未修改 Skill 原文件**，加 `PYTHONUTF8=1` 重跑后结果：

```
All validations PASSED!
EXIT=0
```

补充自查：ZIP 完整性正常（43 个部件，`testzip()` 无错误）；文字占位符扫描无残留；用本机真实“微软雅黑”字体度量逐框估算，所有文本均在容器内（无溢出）。

## 复现方式

```powershell
cd "E:\HuaweiMoveData\Users\22181\Desktop\开源软件作业\pi-agent"
$env:NODE_PATH="D:\Pi-Agent\pptx-runtime\node_modules"
D:\Node.js\node.exe ppt-output\generate.js --force
```

脚本默认拒绝覆盖已有输出，仅显式加 `--force` 才重建。未修改 README、其他项目、Skill 文件或全局配置，未读取密钥，未执行 Git 提交。