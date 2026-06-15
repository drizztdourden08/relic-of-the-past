/* @layer tooling-scripts @kind build */
/**
 * Ensure the WASM core (apps/web/public/wasm/zelda3.{js,wasm}) exists and is
 * current before dev/build.
 *
 * The wasm is gitignored and produced by Emscripten (core/wasm-build/build.mjs) — a
 * step npm doesn't run — so a fresh clone, or a change to any C source, would leave a
 * missing/stale core and the game would black-screen. Wired as predev/prebuild, this:
 *   - is a fast mtime check that NO-OPS when the wasm is newer than every C source, and
 *   - rebuilds automatically when the wasm is missing or any C source / build.mjs is newer.
 *
 * Cross-platform: it delegates to core/wasm-build/build.mjs (the single source of truth).
 * On Windows it sources emsdk_env first ($EMSDK, else the documented default
 * E:\GameProjects\emsdk; set EMSDK to override). On Linux/macOS it expects emcc already
 * on PATH (CI activates it via emscripten-core/setup-emsdk); if emcc is missing it warns
 * and you build manually (docs/contributing/building-wasm.md).
 */
import { existsSync, statSync, readdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';

const repoRoot = resolve(import.meta.dirname, '..');
const wasmOutputs = ['zelda3.js', 'zelda3.wasm'].map((f) => join(repoRoot, 'apps/web/public/wasm', f));
const buildScript = join(repoRoot, 'core/wasm-build/build.mjs');
const sourceRoots = ['core/zelda3/src', 'core/zelda3/snes', 'core/game-hooks', 'core/wasm-build'].map((d) => join(repoRoot, d));
const SOURCE_EXTS = new Set(['.c', '.h']);

const newestSourceMtime = (dir) => {
  let newest = 0;
  if (!existsSync(dir)) return newest;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) newest = Math.max(newest, newestSourceMtime(full));
    else if (SOURCE_EXTS.has(extname(entry.name))) newest = Math.max(newest, statSync(full).mtimeMs);
  }
  return newest;
};

// Returns a human reason the wasm needs (re)building, or null when it's current.
const staleReason = () => {
  if (!wasmOutputs.every(existsSync)) return 'WASM core is missing';
  const builtAt = Math.min(...wasmOutputs.map((f) => statSync(f).mtimeMs));
  const sourceAt = Math.max(...sourceRoots.map(newestSourceMtime), statSync(buildScript).mtimeMs);
  return sourceAt > builtAt ? 'C sources changed since the last build' : null;
};

const reason = staleReason();
if (!reason) {
  console.log('[ensure-wasm] WASM core is up to date.');
  process.exit(0);
}

console.log(`[ensure-wasm] ${reason} — building the WASM core (this takes a minute)...`);

if (process.platform === 'win32') {
  // Windows: emcc isn't on PATH until emsdk_env is sourced. Use a sequential
  // wrapper batch (more reliable than && chaining): activate emsdk, then run the
  // shared build script BY FULL PATH.
  const emsdk = process.env.EMSDK || 'E:\\GameProjects\\emsdk';
  const emsdkEnv = join(emsdk, 'emsdk_env.bat');
  if (!existsSync(emsdkEnv)) {
    console.warn(`[ensure-wasm] ${reason}, but the Emscripten SDK was not found at "${emsdk}". Set the EMSDK env var or build manually (build-wasm). The game will not load until the WASM core is built.`);
    process.exit(0);
  }
  const wrapper = join(tmpdir(), `rotp-ensure-wasm-${process.pid}.bat`);
  writeFileSync(wrapper, `@echo off\r\ncall "${emsdkEnv}"\r\nnode "${buildScript}"\r\nexit /b %ERRORLEVEL%\r\n`);
  try {
    execSync(`cmd /c "${wrapper}"`, { stdio: 'inherit' });
  } catch {
    console.error('[ensure-wasm] WASM build failed — see the emcc output above.');
    process.exit(1);
  } finally {
    rmSync(wrapper, { force: true });
  }
} else {
  // Linux/macOS (incl. CI): emcc is expected on PATH (setup-emsdk). Delegate directly.
  try {
    execSync(`node "${buildScript}"`, { stdio: 'inherit' });
  } catch {
    console.error('[ensure-wasm] WASM build failed. Is emcc on PATH? Activate the Emscripten SDK (emsdk_env) or see docs/contributing/building-wasm.md.');
    process.exit(1);
  }
}

if (staleReason()) {
  console.error('[ensure-wasm] Build finished but the WASM core is still missing/stale.');
  process.exit(1);
}
console.log('[ensure-wasm] WASM core built.');
