# @layer scripts @kind tooling
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$lock = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'toolchain-lock.json') -Raw | ConvertFrom-Json
$launcher = Join-Path $PSScriptRoot "toolchain\ghidra_$($lock.ghidra.version)_PUBLIC\ghidraRun.bat"
if (-not (Test-Path -LiteralPath $launcher)) { throw 'Run setup-toolchain.ps1 first.' }
Start-Process -FilePath $launcher -WorkingDirectory (Split-Path -Parent $launcher)

