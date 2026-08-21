/* @layer tooling-scripts @kind build */
/**
 * `npm run auto -- <name> [--auto-state=...] [--screenshot=...] [--visible]
 * [--skip-provision] [--no-cheats] [--quick-slot=N] [--rom=FILE]`
 *
 * The ONE way to launch the app for automation or handover, from any worktree —
 * one already registered with `wt new`/`wt claim`, or an ad-hoc session worktree
 * (e.g. `.claude/worktrees/<name>`) that was never registered at all. Everything
 * else this used to take multiple manual steps to get right: build, provision a
 * profile (fixtures, cheats, saves), then launch with the right flags. This does
 * all three, in order, every time.
 *
 * `--visible` drops the automation flags (`--no-focus --muted`) for a handover to
 * the user; without it, the launch is headless — see the test-app skill.
 */
import { existsSync, statSync, readdirSync } from 'node:fs';
import { execFileSync, spawn } from 'node:child_process';
import { join, extname } from 'node:path';
import { readRegistry, findRecord } from './parallel/registry.mjs';
import { provisionProfile } from './parallel/provision-profile.mjs';
import { flag, parseArgs } from './parallel/args.mjs';
import { wireAiConfig } from './wire-ai-config.mjs';

const NAME_RULE = /^[a-z0-9][a-z0-9-]{0,38}$/;

const OWN_FLAGS = new Set(['skip-provision', 'no-cheats', 'visible', 'quick-slot', 'rom', 'from-profile']);

const usage = 'Usage: npm run auto -- <name> [--auto-state=...] [--visible] [--skip-provision] [--no-cheats] [--quick-slot=N]';

const resolvePath = async (name) => {
  const entry = findRecord(readRegistry(), name);
  return entry ? entry.path : process.cwd();
};

/** Mirrors ensure-wasm.mjs's own mtime check, one layer up: is the electron dist stale
 * relative to the renderer/electron TS sources or the wasm core it bundles? */
const SOURCE_EXTS = new Set(['.ts', '.tsx']);
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

const distIsStale = (path) => {
  const mainJs = join(path, 'dist', 'electron', 'main.js');
  if (!existsSync(mainJs)) return true;
  const builtAt = statSync(mainJs).mtimeMs;
  const sourceRoots = ['apps/web/src', 'apps/desktop/electron', 'shared'].map((d) => join(path, d));
  const wasmFile = join(path, 'apps/web/public/wasm/zelda3.wasm');
  const wasmAt = existsSync(wasmFile) ? statSync(wasmFile).mtimeMs : 0;
  return Math.max(...sourceRoots.map(newestSourceMtime), wasmAt) > builtAt;
};

const ensureBuilt = (path) => {
  console.log('[auto] Ensuring the WASM core is current…');
  execFileSync('node', ['scripts/ensure-wasm.mjs'], { cwd: path, stdio: 'inherit' });

  if (!distIsStale(path)) {
    console.log('[auto] Electron build is up to date.');
    return;
  }
  console.log('[auto] Building the app (electron-vite build)…');
  execFileSync('npx', ['electron-vite', 'build'], { cwd: path, stdio: 'inherit' });
};

const passThroughArgs = (options, positional) => {
  const args = [];
  for (const [key, value] of Object.entries(options)) {
    if (OWN_FLAGS.has(key)) continue;
    args.push(value === true ? `--${key}` : `--${key}=${value}`);
  }
  args.push(...positional.slice(1)); // anything after <name> that parsed as positional
  return args;
};

const run = async () => {
  const { positional, options } = parseArgs(process.argv.slice(2));
  const [name] = positional;
  if (!name || !NAME_RULE.test(name)) throw new Error(usage);

  const path = await resolvePath(name);

  // Self-heal the case that made every hook in this repo silently dead: a worktree with
  // no .claude/ (gitignored, so `git worktree add` never creates it) loads no settings and
  // therefore fires no hooks. Wiring it here means the next session in this worktree is
  // guarded even if nobody remembered `npm run wire` — the launch is the one command that
  // is always run, so it is the one place the check is guaranteed to happen.
  if (!existsSync(join(path, '.claude', 'settings.json'))) {
    console.log('[auto] This worktree has no .claude/settings.json — no hooks would fire here. Wiring it…');
    wireAiConfig(path);
    console.log('[auto] Wired. RESTART the session for hooks and the guide to load.');
  }

  ensureBuilt(path);

  if (!flag(options, 'skip-provision')) {
    const quickSlotRaw = options['quick-slot'];
    const quickSlot = quickSlotRaw != null ? Number(quickSlotRaw) - 1 : null; // UI is 1-based
    console.log('[auto] Provisioning the game profile…');
    const result = await provisionProfile({
      name,
      romFile: typeof options.rom === 'string' ? options.rom : null,
      inheritConfigFrom: typeof options['from-profile'] === 'string' ? options['from-profile'] : null,
      quickSlot,
      seedFixtureSaves: true,
      seedCheats: !flag(options, 'no-cheats'),
    });
    console.log(`  profile ${name} → ${result.romFile} (cheats ${flag(options, 'no-cheats') ? 'off' : 'on'})`);
  } else {
    console.log('[auto] --skip-provision: using the profile as-is.');
  }

  const visible = flag(options, 'visible');
  const args = [
    'dist/electron/main.js',
    ...(visible ? [] : ['--no-focus', '--muted']),
    `--instance=${name}`,
    ...passThroughArgs(options, positional),
  ];
  console.log(`[auto] ${path}> npx electron ${args.join(' ')}`);
  const child = spawn('npx', ['electron', ...args], { cwd: path, stdio: 'inherit', shell: process.platform === 'win32' });
  child.on('close', (code) => process.exit(code ?? 0));
};

await run();
