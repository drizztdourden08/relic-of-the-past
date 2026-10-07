# @layer scripts @kind tooling
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$toolRoot = Join-Path $PSScriptRoot 'toolchain'
$downloadRoot = Join-Path $toolRoot 'downloads'
$lockPath = Join-Path $PSScriptRoot 'toolchain-lock.json'
$lock = Get-Content -LiteralPath $lockPath -Raw | ConvertFrom-Json

New-Item -ItemType Directory -Path $downloadRoot -Force | Out-Null

function Get-PinnedArchive {
  param(
    [Parameter(Mandatory)] [string] $Url,
    [Parameter(Mandatory)] [string] $Destination,
    [string] $Sha256
  )

  if (-not (Test-Path -LiteralPath $Destination)) {
    Write-Host "Downloading $([IO.Path]::GetFileName($Destination))..."
    Invoke-WebRequest -Uri $Url -OutFile $Destination
  }

  $actual = (Get-FileHash -LiteralPath $Destination -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($Sha256 -and $actual -ne $Sha256.ToLowerInvariant()) {
    throw "SHA-256 mismatch for $Destination. Expected $Sha256, got $actual"
  }
  Write-Host "Verified $([IO.Path]::GetFileName($Destination)): $actual"
  return $actual
}

$ghidraArchive = Join-Path $downloadRoot $lock.ghidra.archive
$null = Get-PinnedArchive -Url $lock.ghidra.url -Destination $ghidraArchive -Sha256 $lock.ghidra.sha256
$ghidraHome = Join-Path $toolRoot "ghidra_$($lock.ghidra.version)_PUBLIC"
if (-not (Test-Path -LiteralPath (Join-Path $ghidraHome 'ghidraRun.bat'))) {
  Write-Host "Extracting Ghidra $($lock.ghidra.version)..."
  Expand-Archive -LiteralPath $ghidraArchive -DestinationPath $toolRoot -Force
}

$mgbaArchive = Join-Path $downloadRoot $lock.mgba.archive
$mgbaHash = Get-PinnedArchive -Url $lock.mgba.url -Destination $mgbaArchive -Sha256 $lock.mgba.sha256
$mgbaExtractRoot = Join-Path $toolRoot "mGBA-$($lock.mgba.version)-win64"
$mgbaHome = Join-Path $mgbaExtractRoot "mGBA-$($lock.mgba.version)-win64"
if (-not (Test-Path -LiteralPath (Join-Path $mgbaHome 'mGBA.exe'))) {
  Write-Host "Extracting mGBA $($lock.mgba.version)..."
  New-Item -ItemType Directory -Path $mgbaExtractRoot -Force | Out-Null
  & tar.exe -xf $mgbaArchive -C $mgbaExtractRoot
  if ($LASTEXITCODE -ne 0) { throw 'The Windows archive tool could not extract the mGBA 7z archive.' }
}
$portableMarker = Join-Path $mgbaHome 'portable.ini'
if (-not (Test-Path -LiteralPath $portableMarker)) {
  New-Item -ItemType File -Path $portableMarker | Out-Null
}

$gdbInstaller = Join-Path $downloadRoot $lock.armGdb.archive
$null = Get-PinnedArchive -Url $lock.armGdb.url -Destination $gdbInstaller -Sha256 $lock.armGdb.sha256
$gdbHome = Join-Path $toolRoot "arm-gnu-toolchain-$($lock.armGdb.version)"
$gdbExecutable = Join-Path $gdbHome 'bin\arm-none-eabi-gdb.exe'
if (-not (Test-Path -LiteralPath $gdbExecutable)) {
  Write-Host "Installing ARM GDB $($lock.armGdb.version) into the local toolchain..."
  $install = Start-Process -FilePath $gdbInstaller -ArgumentList @('/S', "/D=$gdbHome") -Wait -PassThru -WindowStyle Hidden
  if ($install.ExitCode -ne 0 -or -not (Test-Path -LiteralPath $gdbExecutable)) {
    throw "ARM GDB installer failed with exit code $($install.ExitCode)"
  }
}

$loaderRoot = Join-Path $toolRoot 'GhidraGBA-source'
if (-not (Test-Path -LiteralPath (Join-Path $loaderRoot '.git'))) {
  Write-Host 'Cloning the pinned GhidraGBA loader source...'
  git clone --quiet $lock.ghidraGba.repository $loaderRoot
}
git -C $loaderRoot fetch --quiet origin
git -C $loaderRoot checkout --quiet --detach $lock.ghidraGba.commit

$javaVersion = (& cmd.exe /d /c 'java -version 2>&1' | Select-Object -First 1).ToString()
$result = [ordered]@{
  ghidraHome = $ghidraHome
  ghidraVersion = $lock.ghidra.version
  mgbaHome = $mgbaHome
  mgbaVersion = $lock.mgba.version
  mgbaSha256 = $mgbaHash
  mgbaPortableConfig = $portableMarker
  armGdb = $gdbExecutable
  armGdbVersion = $lock.armGdb.version
  ghidraGbaSource = $loaderRoot
  ghidraGbaCommit = $lock.ghidraGba.commit
  java = $javaVersion
}
$result | ConvertTo-Json
