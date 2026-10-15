# @layer scripts @kind tooling
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$lock = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'toolchain-lock.json') -Raw | ConvertFrom-Json
$gdb = Join-Path $PSScriptRoot "toolchain\arm-gnu-toolchain-$($lock.armGdb.version)\bin\arm-none-eabi-gdb.exe"
$commands = Join-Path $PSScriptRoot 'gdb-init.txt'
if (-not (Test-Path -LiteralPath $gdb)) { throw 'Run setup-toolchain.ps1 first.' }
& $gdb '-x' $commands

