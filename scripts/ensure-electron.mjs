/* @layer tooling-scripts @kind build */
/**
 * Check that Electron's prebuilt binary is present and usable before dev/build.
 * `node_modules/electron` is two parts (the JS shim and the downloaded binary in
 * `dist/` + `path.txt`), and either can go missing on its own; both look like an
 * opaque `Error: Electron uninstall` from electron-vite. Repairs: shim intact but
 * binary missing/stale, run install.js; shim broken, reinstall the package first.
 * Wired as postinstall and predev/prebuild. Locked files are reported, never
 * force-killed: the user may be running the app alongside.
 */
import { existsSync, readFileSync, realpathSync, rmSync } from 'node:fs';
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

// node_modules/electron is a pnpm link into node_modules/.pnpm. Clear the real folder
// so the forced install below writes it again from the store.
const realPackageDir = () => {
  try {
    return realpathSync(packageDir);
  } catch {
    return packageDir;
  }
};

const runInstallScript = () => {
  if (!existsSync(installScript)) return;
  try {
    execSync(`node "${installScript}"`, { cwd: packageDir, stdio: 'inherit' });
  } catch {
    /* fall through to the post-repair check, which reports what's still wrong */
  }
};

// Reinstall from the lockfile, so a repair can't drift the tree.
const reinstallPackage = () => {
  console.log('[ensure-electron] Reinstalling electron from the lockfile (this downloads ~100 MB)...');
  try {
    rmSync(realPackageDir(), { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  } catch {
    console.error(
      '[ensure-electron] Could not clear node_modules/electron. A file in it is in use. Close any instance of the app running from this checkout, then run `pnpm run ensure-electron`.',
    );
    process.exit(1);
  }
  try {
    execSync('pnpm install --frozen-lockfile --force', { cwd: repoRoot, stdio: 'inherit' });
  } catch {
    console.error('[ensure-electron] `pnpm install` failed. See the output above (offline? registry unreachable?).');
    process.exit(1);
  }
};

const reason = brokenReason();
if (!reason) {
  console.log('[ensure-electron] Electron binary is ready.');
  process.exit(0);
}

console.log(`[ensure-electron] ${reason}. Repairing...`);
runInstallScript();

if (brokenReason()) {
  reinstallPackage();
  runInstallScript();
}

const remaining = brokenReason();
if (remaining) {
  console.error(`[ensure-electron] Repair finished but ${remaining}. Delete node_modules/electron and run \`pnpm install\`.`);
  process.exit(1);
}
console.log('[ensure-electron] Electron binary is ready.');
