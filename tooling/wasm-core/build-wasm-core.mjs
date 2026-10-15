/* @layer tooling-scripts @kind build */
import { execSync, spawnSync } from 'node:child_process';
import { existsSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..', '..');
const buildScript = join(repoRoot, 'core', 'wasm-build', 'build.mjs');

const mainEmsdk = () => {
  const gitCommon = execSync('git rev-parse --path-format=absolute --git-common-dir', { cwd: repoRoot, encoding: 'utf8' }).trim();
  return join(dirname(gitCommon), 'third_party', 'emsdk');
};

const buildOnWindows = () => {
  const emsdk = process.env.EMSDK || mainEmsdk();
  const emsdkEnv = join(emsdk, 'emsdk_env.bat');
  if (!existsSync(emsdkEnv)) {
    console.error(`[build-wasm-core] The Emscripten SDK was not found at "${emsdk}". Set EMSDK or install it in the main checkout's third_party/emsdk.`);
    return 1;
  }
  const wrapper = join(tmpdir(), `rotp-build-wasm-core-${process.pid}.bat`);
  writeFileSync(wrapper, `@echo off\r\ncall "${emsdkEnv}"\r\nnode "${buildScript}"\r\nexit /b %ERRORLEVEL%\r\n`);
  try {
    return spawnSync(process.env.COMSPEC || 'cmd.exe', ['/c', wrapper], { stdio: 'inherit', windowsHide: true }).status ?? 1;
  } finally {
    rmSync(wrapper, { force: true });
  }
};

const buildElsewhere = () => spawnSync(process.execPath, [buildScript], { stdio: 'inherit' }).status ?? 1;

process.exitCode = process.platform === 'win32' ? buildOnWindows() : buildElsewhere();
