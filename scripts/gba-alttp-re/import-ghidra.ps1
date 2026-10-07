# @layer scripts @kind tooling
[CmdletBinding()]
param(
  [string] $Rom,
  [switch] $Overwrite
)

$ErrorActionPreference = 'Stop'
if (-not $Rom) {
  $Rom = Join-Path $PSScriptRoot '..\..\test-roms\Legend of Zelda, The - A Link to the Past & Four Swords (USA).gba'
}
$lock = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'toolchain-lock.json') -Raw | ConvertFrom-Json
$headless = Join-Path $PSScriptRoot "toolchain\ghidra_$($lock.ghidra.version)_PUBLIC\support\analyzeHeadless.bat"
$projectRoot = Join-Path $PSScriptRoot 'ghidra-projects'
$scriptRoot = Join-Path $PSScriptRoot 'ghidra_scripts'
$anchors = Join-Path $PSScriptRoot 'anchors.json'
$inputRoot = Join-Path $PSScriptRoot 'artifacts\input'
$stagedRom = Join-Path $inputRoot 'alttp-gba-us.gba'

if (-not (Test-Path -LiteralPath $headless)) { throw 'Run setup-toolchain.ps1 first.' }
if (-not (Test-Path -LiteralPath $Rom)) { throw "ROM not found: $Rom" }
New-Item -ItemType Directory -Path $projectRoot -Force | Out-Null
New-Item -ItemType Directory -Path $inputRoot -Force | Out-Null
if (-not (Test-Path -LiteralPath $stagedRom)) {
  New-Item -ItemType HardLink -Path $stagedRom -Target (Resolve-Path -LiteralPath $Rom).Path | Out-Null
}

$arguments = @(
  $projectRoot,
  'alttp-gba-us',
  '-import', $stagedRom,
  '-loader', 'BinaryLoader',
  '-loader-baseAddr', '0x08000000',
  '-processor', 'ARM:LE:32:v4t',
  '-preScript', 'GbaAlttpSetup.java', $anchors,
  '-scriptPath', $scriptRoot,
  '-noanalysis'
)
if ($Overwrite) { $arguments += '-overwrite' }

& $headless @arguments
if ($LASTEXITCODE -ne 0) { throw "Ghidra import failed with exit code $LASTEXITCODE" }
