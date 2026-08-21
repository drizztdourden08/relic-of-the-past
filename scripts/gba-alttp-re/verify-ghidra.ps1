# @layer scripts @kind tooling
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$lock = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'toolchain-lock.json') -Raw | ConvertFrom-Json
$headless = Join-Path $PSScriptRoot "toolchain\ghidra_$($lock.ghidra.version)_PUBLIC\support\analyzeHeadless.bat"
$projectRoot = Join-Path $PSScriptRoot 'ghidra-projects'
$scriptRoot = Join-Path $PSScriptRoot 'ghidra_scripts'

if (-not (Test-Path -LiteralPath $headless)) { throw 'Run setup-toolchain.ps1 first.' }
& $headless $projectRoot 'alttp-gba-us' `
  '-process' 'alttp-gba-us.gba' `
  '-postScript' 'GbaAlttpVerify.java' `
  '-scriptPath' $scriptRoot `
  '-noanalysis'
if ($LASTEXITCODE -ne 0) { throw "Ghidra verification failed with exit code $LASTEXITCODE" }

