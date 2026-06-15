/* @layer tooling-scripts @kind script */
/** Shell helpers shared by the deploy scripts. */
import { execFileSync } from 'node:child_process';

const log = (msg) => console.log(`\x1b[36m[deploy]\x1b[0m ${msg}`);
const warn = (msg) => console.warn(`\x1b[33m[deploy]\x1b[0m ${msg}`);
const fail = (msg) => {
  console.error(`\x1b[31m[deploy] ${msg}\x1b[0m`);
  process.exit(1);
};

const run = (file, args, opts = {}) => execFileSync(file, args, { stdio: 'inherit', ...opts });
const capture = (file, args, opts = {}) => execFileSync(file, args, { encoding: 'utf8', ...opts }).trim();

const wsl = (distro, bashCmd, opts = {}) => run('wsl', ['-d', distro, 'bash', '-lc', bashCmd], opts);
const wslCapture = (distro, bashCmd, opts = {}) =>
  capture('wsl', ['-d', distro, 'bash', '-lc', bashCmd], opts);

// Synchronous sleep (no busy-wait) — used while polling the emulator boot state.
const sleep = (ms) => {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
};

export { log, warn, fail, run, capture, wsl, wslCapture, sleep };
