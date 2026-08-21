# @layer scripts @kind tooling
[CmdletBinding()]
param(
  [string] $Rom
)

$ErrorActionPreference = 'Stop'
if (-not $Rom) {
  $Rom = Join-Path $PSScriptRoot '..\..\test-roms\Legend of Zelda, The - A Link to the Past & Four Swords (USA).gba'
}
$lock = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'toolchain-lock.json') -Raw | ConvertFrom-Json
$executable = Join-Path $PSScriptRoot "toolchain\mGBA-$($lock.mgba.version)-win64\mGBA-$($lock.mgba.version)-win64\mGBA.exe"
if (-not (Test-Path -LiteralPath $executable)) { throw 'Run setup-toolchain.ps1 first.' }
if (-not (Test-Path -LiteralPath $Rom)) { throw "ROM not found: $Rom" }
Start-Process -FilePath $executable -ArgumentList @('-d', (Resolve-Path -LiteralPath $Rom).Path)
