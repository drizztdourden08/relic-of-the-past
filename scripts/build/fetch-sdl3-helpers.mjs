/* @layer tooling-scripts @kind logic */
/**
 * Download, hashing, extraction, and system-package-detection helpers for
 * scripts/build/fetch-sdl3.mjs. Split out to keep that file under the
 * repo's per-file line limit.
 */
import { createHash } from 'node:crypto';
import { createWriteStream, mkdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

// Computes the SHA-256 of a file already on disk, as a lowercase hex string.
const sha256File = (filePath) => {
  const hash = createHash('sha256');
  hash.update(readFileSync(filePath));
  return hash.digest('hex');
};

// Downloads a URL to destPath (creating parent directories as needed) using
// the platform fetch, streamed straight to disk rather than buffered in memory.
const downloadFile = async (url, destPath) => {
  mkdirSync(dirname(destPath), { recursive: true });
  console.log(`[fetch-sdl3] Downloading ${url}`);
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`HTTP ${response.status} ${response.statusText} for ${url}`);
  }
  await pipeline(Readable.fromWeb(response.body), createWriteStream(destPath));
  console.log(`[fetch-sdl3] Saved ${destPath}`);
};

// Verifies a downloaded file's SHA-256 against the pinned hash for `label`.
// A present hash that doesn't match is a hard error. A missing (null) hash
// prints the real hash with a loud warning and proceeds anyway, so the first
// run of a new pin is usable while still telling the user what to paste in.
const verifyChecksum = (filePath, expectedHash, label) => {
  const actual = sha256File(filePath);
  if (expectedHash == null) {
    console.warn(
      `[fetch-sdl3] WARNING: no pinned checksum for "${label}" — proceeding UNVERIFIED.\n` +
        `[fetch-sdl3] Computed SHA-256: ${actual}\n` +
        '[fetch-sdl3] Verify this against the GitHub release page, then paste it into the ' +
        'CHECKSUMS map in scripts/build/fetch-sdl3.mjs so future runs are actually checked.',
    );
    return;
  }
  if (actual !== expectedHash) {
    throw new Error(
      `Checksum mismatch for "${label}".\n  expected: ${expectedHash}\n  actual:   ${actual}\n` +
        'The download is corrupted or does not match the pinned release — delete ' +
        'third_party/sdl3/downloads and retry.',
    );
  }
  console.log(`[fetch-sdl3] Checksum OK for "${label}".`);
};

// Extracts a .zip via PowerShell's Expand-Archive (available on every
// supported Windows version, incl. from Git Bash, without extra deps).
const extractZipWindows = (zipPath, destDir) => {
  mkdirSync(destDir, { recursive: true });
  console.log(`[fetch-sdl3] Extracting ${zipPath} -> ${destDir}`);
  execFileSync(
    'powershell.exe',
    ['-NoProfile', '-NonInteractive', '-Command', `Expand-Archive -Path "${zipPath}" -DestinationPath "${destDir}" -Force`],
    { stdio: 'inherit' },
  );
};

// GNU tar's remote-file heuristic misreads a Windows drive-letter path (e.g.
// "E:\foo\bar.tar.gz") as a "host:path" remote spec and tries to open an rsh
// connection instead of the local file. Forward slashes plus --force-local
// (belt and suspenders — tested to need both on Git-for-Windows' bundled GNU
// tar) tell it the argument is always a local path.
//
// The flag is GNU tar's alone, so which tar is actually on PATH decides it,
// not which OS this is. BSD tar rejects it outright and fails the extraction,
// and it ships as `tar` on macOS AND on Windows since Windows 10, while Git
// for Windows puts GNU tar there instead. Only GNU tar has the drive-letter
// problem, so asking the binary what it is gets every combination right.
const forSlash = (p) => p.replace(/\\/g, '/');
const tarIsGnu = () => {
  try {
    return /GNU tar/i.test(execFileSync('tar', ['--version'], { encoding: 'utf8' }));
  } catch {
    return false;
  }
};
const localFlag = tarIsGnu() ? ['--force-local'] : [];

const extractTarGz = (tarPath, destDir) => {
  mkdirSync(destDir, { recursive: true });
  console.log(`[fetch-sdl3] Extracting ${tarPath} -> ${destDir}`);
  execFileSync('tar', [...localFlag, '-xzf', forSlash(tarPath), '-C', forSlash(destDir)], { stdio: 'inherit' });
};

// Best-effort .7z extraction via `tar` (modern bsdtar/libarchive builds can
// read 7z). Returns false instead of throwing so the caller can fall back to
// printing manual instructions rather than failing the whole run.
const extractSevenZipBestEffort = (archivePath, destDir) => {
  mkdirSync(destDir, { recursive: true });
  try {
    execFileSync('tar', [...localFlag, '-xf', forSlash(archivePath), '-C', forSlash(destDir)], { stdio: 'inherit' });
    return true;
  } catch {
    return false;
  }
};

// Runs a command purely to check success/failure (e.g. `pkg-config --exists`).
const commandSucceeds = (cmd, args) => {
  try {
    execFileSync(cmd, args, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

export { sha256File, downloadFile, verifyChecksum, extractZipWindows, extractTarGz, extractSevenZipBestEffort, commandSucceeds };
