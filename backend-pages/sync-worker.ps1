$ErrorActionPreference = 'Stop'

$source = Join-Path $PSScriptRoot '..\backend\src\worker.js'
$target = Join-Path $PSScriptRoot 'public\_worker.js'
Copy-Item -LiteralPath $source -Destination $target -Force
Write-Host "Synced $source -> $target"
