/* @layer tooling-scripts @kind build */
/**
 * Ensure Electron's prebuilt binary is present and usable before dev/build.
 *
 * `node_modules/electron` is a two-part package: npm installs the JS shim
 * (package.json / index.js / install.js) and a separate download step extracts the
 * platform binary into `dist/` and records it in `path.txt`. Either half can go
 * missing on its own — Electron's `postinstall` not firing leaves the shim without a
 * binary, and an install interrupted while the app is running (EBUSY on the locked
 * `electron.exe`) leaves a stray `dist/` with no shim around it. Both look the same
 * from the outside: `electron-vite` dies with an opaque `Error: Electron uninstall`.
 *
 * So this guard validates the whole package, then repairs whatever is wrong:
 *   1. the shim is intact but the binary is missing/stale -> run Electron's install.js
 *   2. the shim itself is broken/absent -> reinstall the package, then install.js
 * It's wired as `postinstall` and as `predev`/`prebuild`, and no-ops when all is well.
 *
 * A repair wipes the package directory and re-downloads, rather than trying to salvage
 * a partial `dist/` — install.js re-downloads on a missing `path.txt` anyway, so the
 * salvage would buy nothing. Locked files are reported, never force-killed: the user
 * runs their own game session alongside this.
 */
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const repoRoot = resolve(import.meta.dirname, '..');
const packageDir = join(repoRoot, 'node_modules', 'electron');
const installScript = join(packageDir, 'install.js');

const readJson = (file) => {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
};

const readText = (file) => {
  try {
    return readFileSync(file, 'utf8').trim();
  } catch {
    return null;
  }
};

// Outside an Electron process, `require('electron')` resolves to the binary path
// string (read from the package's path.txt); it throws when that file is missing.
const binaryPath = () => {
  try {
    const resolved = require('electron');
    return typeof resolved === 'string' ? resolved : null;
  } catch {
    return null;
  }
};

// A human reason the package can't be used as-is, or null when it's healthy.
const brokenReason = () => {
  const shimVersion = readJson(join(packageDir, 'package.json'))?.version;
  if (!shimVersion) {
    return existsSync(packageDir)
      ? 'the electron package is incomplete (no package.json)'
      : 'the electron package is not installed';
  }
  if (!existsSync(installScript)) return 'the electron package is incomplete (no install.js)';
  const binary = binaryPath();
  if (!binary || !existsSync(binary)) return 'the electron binary is missing';
  const distVersion = readText(join(packageDir, 'dist', 'version'))?.replace(/^v/, '');
  if (distVersion !== shimVersion) {
    return `the extracted binary (v${distVersion ?? '?'}) doesn't match the electron package (v${shimVersion})`;
  }
  return null;
};

// Reinstall the exact version the lockfile pins, so a repair can't drift the tree.
const wantedSpec = () => {
  const locked = readJson(join(repoRoot, 'package-lock.json'))?.packages?.['node_modules/electron']?.version;
  if (locked) return `electron@${locked}`;
  const range = readJson(join(repoRoot, 'package.json'))?.devDependencies?.electron;
  return range ? `electron@${range}` : 'electron';
};

const runInstallScript = () => {
  if (!existsSync(installScript)) return;
  try {
    execSync(`node "${installScript}"`, { cwd: packageDir, stdio: 'inherit' });
  } catch {
    /* fall through to the post-repair check, which reports what's still wrong */
  }
};

const reinstallPackage = () => {
  const spec = wantedSpec();
  console.log(`[ensure-electron] Reinstalling ${spec} (this downloads ~100 MB)...`);
  try {
    rmSync(packageDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  } catch {
    console.error(
      '[ensure-electron] Could not clear node_modules/electron — a file in it is in use. Close any instance of the app running from this checkout, then run `npm run ensure-electron`.',
    );
    process.exit(1);
  }
  try {
    execSync(`npm install ${spec} --no-save --no-audit --no-fund`, { cwd: repoRoot, stdio: 'inherit' });
  } catch {
    console.error('[ensure-electron] `npm install` failed — see the output above (offline? registry unreachable?).');
    process.exit(1);
  }
};

const reason = brokenReason();
if (!reason) {
  console.log('[ensure-electron] Electron binary is ready.');
  process.exit(0);
}

console.log(`[ensure-electron] ${reason} — repairing...`);
runInstallScript();

if (brokenReason()) {
  reinstallPackage();
  runInstallScript();
}

const remaining = brokenReason();
if (remaining) {
  console.error(`[ensure-electron] Repair finished but ${remaining}. Delete node_modules/electron and run \`npm install\`.`);
  process.exit(1);
}
console.log('[ensure-electron] Electron binary is ready.');
