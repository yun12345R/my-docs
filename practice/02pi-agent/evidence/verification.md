# 实践课2材料核验说明

源码固定提交：`c3cc91632d0a1950fb122605b190233f2aa0006e`。材料整理时课程源码工作区无改动。

## 已有实际操作证据

组织 Fork 页面、本人 Clone、目录/远端/分支/提交状态、packages 目录、根构建顺序，以及 telemetry、schema 阅读过程均有原始截图。原图保持未修改；没有把生成图冒充终端截图。

## 静态核验范围

已读取 11 个包的 README、完整 package.json、编译配置，扫描 src 内部包引用，并抽取具体源码位置核对。18 条内部运行依赖与两条额外 evals 开发依赖均有配置及源码依据。PNG、SVG、draw.io 与 Mermaid 的主图使用同一组 11 个节点、18 条边。

## 差异和限制

1. packages 中额外有 evals；未列入根 build，且无 build 脚本。其两条内部依赖均是 devDependencies。
2. 本人指定的源码路径包含中文；不满足“尽量全英文”的建议，但 Clone 与静态读取已成功，尚未验证构建兼容性。
3. ai build 包含模型目录生成；coding-agent build 包含资源复制及打包；env 的 Rust daemon 不在普通 build 中编译。
4. chord 的外部 esbuild/react/ws 是可选 peer 依赖，不是内部节点。
5. 主图中的边按 dependencies 分类；源码证据可能为类型导入，不能据此把图当成每次运行的调用轨迹。
6. 未安装课程依赖，未运行 build/test/真实模型会话；不声称程序构建成功、测试通过或性能达标。
7. 重点模块采用已经实际操作过的 telemetry、schema。后续核验和报告整理由 AI 辅助；不能据此声称本人逐条手动执行了全部后续阅读命令。

## 提交边界

报告、图片和图源放入个人作业仓库；小组组织源码仓库不改动。课程 Issue 由王栋新本人提交，助手不创建 Issue。
