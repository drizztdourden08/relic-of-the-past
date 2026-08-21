# @layer scripts @kind tooling
[CmdletBinding()]
param(
  [string]$Output = (Join-Path $PSScriptRoot 'artifacts\palace-handlers.c')
)

$ErrorActionPreference = 'Stop'
$lock = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'toolchain-lock.json') -Raw | ConvertFrom-Json
$headless = Join-Path $PSScriptRoot "toolchain\ghidra_$($lock.ghidra.version)_PUBLIC\support\analyzeHeadless.bat"
$projectRoot = Join-Path $PSScriptRoot 'ghidra-projects'
$scriptRoot = Join-Path $PSScriptRoot 'ghidra_scripts'
$absoluteOutput = [System.IO.Path]::GetFullPath($Output)

& $headless $projectRoot 'alttp-gba-us' `
  '-process' 'alttp-gba-us.gba' `
  '-postScript' 'GbaAlttpDecompile.java' $absoluteOutput `
  '-scriptPath' $scriptRoot `
  '-noanalysis'
if ($LASTEXITCODE -ne 0) { throw "Ghidra decompilation failed with exit code $LASTEXITCODE" }
