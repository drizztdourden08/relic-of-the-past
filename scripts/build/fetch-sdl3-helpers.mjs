/* @layer tooling-scripts @kind logic */
/** Download, hashing, extraction and system-package helpers for scripts/build/fetch-sdl3.mjs. */
import { createHash } from 'node:crypto';
import { createWriteStream, mkdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const sha256File = (filePath) => {
  const hash = createHash('sha256');
  hash.update(readFileSync(filePath));
  return hash.digest('hex');
};

// Streamed straight to disk, not buffered in memory.
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

// A present hash that does not match is a hard error. A null hash prints the real
// hash with a loud warning and proceeds, so the first run of a new pin is usable.
const verifyChecksum = (filePath, expectedHash, label) => {
  const actual = sha256File(filePath);
  if (expectedHash == null) {
    console.warn(
      `[fetch-sdl3] WARNING: no pinned checksum for "${label}". Proceeding UNVERIFIED.\n` +
        `[fetch-sdl3] Computed SHA-256: ${actual}\n` +
        '[fetch-sdl3] Verify this against the GitHub release page, then paste it into the ' +
        'CHECKSUMS map in scripts/build/fetch-sdl3.mjs so future runs are actually checked.',
    );
    return;
  }
  if (actual !== expectedHash) {
    throw new Error(
      `Checksum mismatch for "${label}".\n  expected: ${expectedHash}\n  actual:   ${actual}\n` +
        'The download is corrupted or does not match the pinned release. Delete ' +
        'third_party/sdl3/downloads and retry.',
    );
  }
  console.log(`[fetch-sdl3] Checksum OK for "${label}".`);
};

// Expand-Archive is available on every supported Windows version without extra deps.
const extractZipWindows = (zipPath, destDir) => {
  mkdirSync(destDir, { recursive: true });
  console.log(`[fetch-sdl3] Extracting ${zipPath} -> ${destDir}`);
  execFileSync(
    'powershell.exe',
    ['-NoProfile', '-NonInteractive', '-Command', `Expand-Archive -Path "${zipPath}" -DestinationPath "${destDir}" -Force`],
    { stdio: 'inherit' },
  );
};

// GNU tar reads a Windows drive-letter path ("E:\foo.tar.gz") as a "host:path"
// remote spec. Forward slashes plus --force-local fix it (Git for Windows' tar
// needs both). The flag is GNU-only and BSD tar (macOS, Windows 10+) rejects it,
// so the binary on PATH is asked which it is.
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

// Best-effort .7z extraction via `tar` (modern bsdtar can read 7z). Returns false
// instead of throwing so the caller can print manual instructions.
const extractSevenZipBestEffort = (archivePath, destDir) => {
  mkdirSync(destDir, { recursive: true });
  try {
    execFileSync('tar', [...localFlag, '-xf', forSlash(archivePath), '-C', forSlash(destDir)], { stdio: 'inherit' });
    return true;
  } catch {
    return false;
  }
};

const commandSucceeds = (cmd, args) => {
  try {
    execFileSync(cmd, args, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

export { sha256File, downloadFile, verifyChecksum, extractZipWindows, extractTarGz, extractSevenZipBestEffort, commandSucceeds };
