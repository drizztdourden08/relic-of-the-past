/* @layer tooling-scripts @kind build */
/**
 * `npm run wire` — give the CURRENT worktree the AI config that git does not carry.
 *
 * `.claude/` and `CLAUDE.md` are gitignored (rendered from the private ai-config repo,
 * never committed), and `git worktree add` materializes only TRACKED files. So a fresh
 * worktree has no project guide, no skills, and — the part that bites hardest — no
 * `.claude/settings.json`, which is where the PreToolUse/Stop hooks live. Claude Code
 * reads those from the working directory, so in such a worktree NO hook fires and no
 * rule is enforced, silently. That is how it failed: correct rules, never loaded.
 *
 * `wt new` already covers its own worktrees via linkGitignoredDeps (scripts/parallel).
 * This is for the ones it never sees — a session worktree under `.claude/worktrees/`,
 * or any manual `git worktree add`.
 *
 * Deliberately narrower than linkGitignoredDeps, for two reasons that are hazards there:
 *   - AI config ONLY. That helper also junctions `shared/game/data/records`, and a
 *     recursive delete follows a junction into the main checkout and empties the target
 *     (see unlinkSharedDirs). Nothing here creates a link, so a worktree removed by the
 *     harness — which never calls unlinkSharedDirs — cannot take the main repo with it.
 *   - `worktrees` is excluded from the copy. The main checkout's `.claude/worktrees/` is
 *     where session worktrees live, so copying `.claude` wholesale copies this worktree
 *     into itself.
 *
 * Hooks and the guide are read once at session start, so a session already running in a
 * freshly wired worktree must be restarted before any of it takes effect.
 */
import { existsSync, mkdirSync, copyFileSync, cpSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const AI_DIRS = ['.claude'];
const AI_FILES = ['CLAUDE.md', 'AGENTS.md', '.mcp.json', '.ai-config.json'];

/** Never copied: the main checkout's session-worktree store, which contains this worktree. */
const EXCLUDED = new Set(['worktrees']);

/**
 * The main checkout, which is not this directory when running from a worktree. Asking git
 * for the common git dir gets back to the real one (the same approach vault/locate.mjs
 * takes); anything unexpected falls back to here, where the copy self-detects as a no-op.
 */
const mainCheckout = (cwd) => {
  try {
    const common = execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], {
      cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
    return common.endsWith('.git') ? resolve(common, '..') : cwd;
  } catch {
    return cwd;
  }
};

/**
 * Copied one child at a time, not as a whole directory: a session worktree lives UNDER the
 * main checkout's `.claude/worktrees/`, and cpSync refuses to copy a directory into a
 * subdirectory of itself — that check fires before any filter, so filtering `worktrees`
 * out is not enough. Per-child, `.claude/skills` -> worktree/.claude/skills contains no
 * such cycle, and the excluded child is simply never visited.
 */
const copyDir = (name, source, dest) => {
  const from = join(source, name);
  if (!existsSync(from)) return { name, action: 'absent' };
  try {
    const to = join(dest, name);
    mkdirSync(to, { recursive: true });
    let copied = 0;
    for (const child of readdirSync(from)) {
      if (EXCLUDED.has(child)) continue;
      cpSync(join(from, child), join(to, child), { recursive: true });
      copied++;
    }
    return { name, action: copied > 0 ? 'copied' : 'empty' };
  } catch (err) {
    return { name, action: `failed (${err.message})` };
  }
};

const copyFile = (name, source, dest) => {
  const from = join(source, name);
  if (!existsSync(from)) return { name, action: 'absent' };
  try {
    const to = join(dest, name);
    mkdirSync(dirname(to), { recursive: true });
    copyFileSync(from, to);
    return { name, action: 'copied' };
  } catch (err) {
    return { name, action: `failed (${err.message})` };
  }
};

/**
 * Copy the AI config from the main checkout into `dest`. Returns null when `dest` IS the
 * main checkout (nothing to do — that is where the config is rendered), so callers can
 * stay quiet in the normal case.
 */
const wireAiConfig = (dest) => {
  const source = mainCheckout(dest);
  if (resolve(source) === resolve(dest)) return null;
  return [
    ...AI_DIRS.map((name) => copyDir(name, source, dest)),
    ...AI_FILES.map((name) => copyFile(name, source, dest)),
  ];
};

const isMain = () => wireAiConfig(process.cwd()) === null;

const main = () => {
  const dest = process.cwd();
  const results = wireAiConfig(dest);
  if (results === null) {
    console.log('[wire] This IS the main checkout — its AI config is rendered by ai-config, nothing to copy.');
    return;
  }
  console.log(`[wire] Supplying ${dest} with the AI config git does not carry:`);
  for (const { name, action } of results) {
    if (action !== 'absent') console.log(`  ${action.padEnd(8)} ${name}`);
  }
  if (!results.some((r) => r.name === 'CLAUDE.md' && r.action === 'copied')) {
    console.warn('  [wire] CLAUDE.md was not copied — an agent here still has no project guide.');
  }
  console.log('\n[wire] RESTART the session: hooks and the guide are read once, at startup.');
};

if (import.meta.filename === resolve(process.argv[1])) main();

export { wireAiConfig, isMain };
