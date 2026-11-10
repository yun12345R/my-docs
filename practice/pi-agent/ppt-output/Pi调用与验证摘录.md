# Pi PPT Skill 调用与验证摘录

日期：2026年11月10日。此记录摘自本机Pi实际JSON事件日志，未经模拟执行。

## 实际调用

Pi 1.5.0，模型deepseek-flash，使用JSON非交互模式处理 `/skill:pptx` 请求。加载后的用户消息包含以下实际技能标签：

```text
<skill name="pptx" location="E:\HuaweiMoveData\Users\22181\Desktop\开源软件作业\pi-agent\.pi\skills\pptx\SKILL.md">
```

任务为生成恰好两页中文Pi Agent实践展示，输出PPT和可复现JS脚本。

## 实际验证

生成过程先检查依赖；缺少的pptxgenjs安装至D:\Pi-Agent\pptx-runtime，defusedxml安装至D:\Pi-Agent\pptx-python。

项目Skill的scripts/office/validate.py在PYTHONUTF8=1环境下返回：

```text
All validations PASSED!
EXIT=0
```

本机另外复核PPTX ZIP无错误，实际页数为2。之后用Microsoft PowerPoint打开，逐页检查文字和版面，两页均正常显示。

PPTX SHA256：`1e3c1049193e63f97dc2280a391e068887056c98fce5d5abb7d5535930187a3b`

原始Pi日志SHA256：`1579ea91c4fe1b77d288f1371a7ff287b394c0961e7b32dc9d783877efc14a85`。完整原始日志保留在本机D盘，不纳入公开提交。
