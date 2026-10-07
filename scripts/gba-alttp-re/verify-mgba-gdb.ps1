# @layer scripts @kind tooling
[CmdletBinding()]
param(
  [int] $Port = 2345
)

$ErrorActionPreference = 'Stop'
$lock = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'toolchain-lock.json') -Raw | ConvertFrom-Json
$gdb = Join-Path $PSScriptRoot "toolchain\arm-gnu-toolchain-$($lock.armGdb.version)\bin\arm-none-eabi-gdb.exe"
if (-not (Test-Path -LiteralPath $gdb)) { throw 'Run setup-toolchain.ps1 first.' }

$commands = @(
  'set confirm off'
  'set pagination off'
  'set remotetimeout 3'
  'set architecture arm'
  "target remote localhost:$Port"
  'info registers pc sp lr cpsr'
  'x/4hx 0x030038f0'
  'x/32bx 0x03003100'
  'disconnect'
  'quit'
)

$commandFile = [IO.Path]::GetTempFileName()
$stdoutFile = [IO.Path]::GetTempFileName()
$stderrFile = [IO.Path]::GetTempFileName()
try {
  Set-Content -LiteralPath $commandFile -Value $commands -Encoding Ascii
  $process = Start-Process -FilePath $gdb -ArgumentList @('--batch', '-x', $commandFile) `
    -RedirectStandardOutput $stdoutFile -RedirectStandardError $stderrFile -PassThru -NoNewWindow
  if (-not $process.WaitForExit(10000)) {
    $process.Kill()
    $process.WaitForExit()
    throw 'GDB probe timed out. Stop and restart mGBA''s GDB server, then retry.'
  }

  $output = @(
    Get-Content -LiteralPath $stdoutFile -ErrorAction SilentlyContinue
    Get-Content -LiteralPath $stderrFile -ErrorAction SilentlyContinue
  )
  $output | Write-Output
  $text = $output -join "`n"
  $readSucceeded = $text -match '(?m)^pc\s+0x[0-9a-f]+' -and $text -match '(?m)^0x0?30038f0:'
  if (-not $readSucceeded -or $text -match 'Cannot access memory|has no registers|packet error') {
    throw 'GDB probe failed. Stop and restart mGBA''s GDB server, then retry.'
  }
} finally {
  Remove-Item -LiteralPath $commandFile, $stdoutFile, $stderrFile -Force -ErrorAction SilentlyContinue
}
