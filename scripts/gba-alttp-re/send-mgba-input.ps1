# @layer scripts @kind tooling
[CmdletBinding()]
param(
  [Parameter(Mandatory)]
  [ValidateSet('Up', 'Down', 'Left', 'Right', 'A', 'B', 'L', 'R', 'Start', 'Select')]
  [string] $Button,
  [ValidateRange(20, 5000)]
  [int] $DurationMs = 250,
  [int] $ProcessId = 0
)

$ErrorActionPreference = 'Stop'
if (-not $ProcessId) {
  $processes = @(Get-Process mGBA -ErrorAction Stop)
  if ($processes.Count -ne 1) { throw 'Specify -ProcessId when more than one mGBA process is running.' }
  $ProcessId = $processes[0].Id
}

$virtualKeys = @{
  Up = 0x26; Down = 0x28; Left = 0x25; Right = 0x27
  A = 0x58; B = 0x5A; L = 0x41; R = 0x53
  Start = 0x0D; Select = 0x08
}

Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class MgbaKeyInput {
    [DllImport("user32.dll")]
    public static extern void keybd_event(byte virtualKey, byte scanCode, uint flags, UIntPtr extraInfo);
}
'@

$shell = New-Object -ComObject WScript.Shell
if (-not $shell.AppActivate($ProcessId)) { throw "Could not focus mGBA process $ProcessId." }
Start-Sleep -Milliseconds 200
$key = [byte] $virtualKeys[$Button]
[MgbaKeyInput]::keybd_event($key, 0, 0, [UIntPtr]::Zero)
try {
  Start-Sleep -Milliseconds $DurationMs
} finally {
  [MgbaKeyInput]::keybd_event($key, 0, 2, [UIntPtr]::Zero)
}
Write-Host "Sent $Button to mGBA for $DurationMs ms."
