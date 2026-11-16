# 实践课2：只读核验与源码阅读命令
# 本文件不执行安装、构建、测试、提交或推送。
$repoDir = 'E:\HuaweiMoveData\Users\22181\Desktop\开源软件作业\02pi-agent\pi-hunnu-2026'
Set-Location $repoDir
# 核对源码来源与版本
Get-Location
git remote -v
git branch --show-current
git rev-parse HEAD
git status --short
# 查看实际模块目录
Get-ChildItem .\packages -Directory
# 查看根构建顺序，不运行 build
$config = Get-Content .\package.json -Raw | ConvertFrom-Json
$config.scripts.build -split '&&'
# 逐个读取完整说明文档、包配置与编译配置
$modules = 'telemetry','schema','chord','tui','codemode','mcp','ai','durable','env','agent','coding-agent'
foreach ($module in $modules) {
    Write-Output "模块：$module"
    Get-Content ".\packages\$module\README.md" -Raw
    Get-Content ".\packages\$module\package.json" -Raw
    Get-Content ".\packages\$module\tsconfig.build.json" -Raw
}
# 交叉核对源码的内部引用（若没有 rg，可用 Select-String）
Get-ChildItem .\packages -Recurse -Filter *.ts -File |
    Where-Object { $_.FullName -match '\\src\\' } |
    Select-String -Pattern '@earendil-works/(pi-|chord)'
# 查看特殊构建的依据
Get-Content .\tsconfig.base.json -Raw
Get-Content .\packages\ai\catalog\README.md -Raw
Get-Content .\scripts\build-coding-agent-bundle.mjs -Raw
Get-Content .\packages\env\daemon\Cargo.toml -Raw
# 核对额外评估目录
Get-Content .\packages\evals\package.json -Raw
