/* @layer tooling-scripts @kind build */
/**
 * Ensure Electron's prebuilt binary is present.
 *
 * Electron normally downloads its platform binary via its own `postinstall`
 * (`node install.js`). In this project that hook isn't firing — the installed
 * `electron` package ships with no `scripts` field — so a fresh `npm install`
 * leaves `node_modules/electron` without `dist/electron.exe`, and `electron-vite`
 * then fails to launch with the opaque `Error: Electron uninstall`.
 *
 * This guard self-heals: it checks for the binary and, if missing, runs Electron's
 * own `install.js`. It's wired as `postinstall` (so installs fetch it) and as
 * `predev` / `prebuild` (so it's guaranteed before the app ever launches, no matter
 * how `node_modules` was reset). It's a no-op when the binary is already present.
 */
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// Outside an Electron process, `require('electron')` resolves to the binary path
// string (read from the package's path.txt); throws/!string when not installed.
const hasElectronBinary = () => {
  try {
    const binaryPath = require('electron');
    return typeof binaryPath === 'string' && existsSync(binaryPath);
  } catch {
    return false;
  }
};

const run = () => {
  if (hasElectronBinary()) return;
  console.log('[ensure-electron] Electron binary missing — running electron install...');
  execSync(`node "${require.resolve('electron/install.js')}"`, { stdio: 'inherit' });
  if (!hasElectronBinary()) {
    console.error('[ensure-electron] install ran but the binary is still missing.');
    process.exit(1);
  }
};

run();
