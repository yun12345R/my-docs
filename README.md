# my-docs

开源软件课程实践项目2：使用 MkDocs Material 编写四页技术文档，通过 GitHub Actions 自动构建并部署到 GitHub Pages。

## 项目入口

- [公开网站](https://yun12345r.github.io/my-docs/)
- [个人实验报告](report/README.md)

## 本地预览

本机使用 Windows、Git Bash 和 Python 3.14。进入项目根目录后，依次执行：

```bash
py -3.14 -m venv .venv
source .venv/Scripts/activate
python -m pip install -r requirements.txt
python -m mkdocs serve
```

在浏览器打开终端显示的地址，本项目为 http://127.0.0.1:8000/my-docs/。

预览结束后，在终端按 Ctrl+C 停止服务。

严格构建检查命令：

```bash
python -m mkdocs build --strict
```