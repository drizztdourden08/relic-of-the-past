/* @layer tooling-scripts @kind logic */
/**
 * `wt new <name>` creates a worktree, provisions its profile and makes it launchable.
 * The expensive path (~825 MB, ~5 min); prefer `wt claim --any` when the pool has a
 * free one. `name` is the worktree directory, the branch suffix (agent/<name>) and
 * the game profile id, so an instance launch needs no lookup.
 */
import { existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { updateRegistry, findRecord, createRecord } from '../registry.mjs';
import { branchFor, repoRoot, worktreePath, worktreeRoot } from '../paths.mjs';
import { baseRef, fetchBase, git } from '../git-status.mjs';
import { bootstrapWorktree } from '../bootstrap.mjs';
import { provisionProfile } from '../provision-profile.mjs';
import { launchLine } from '../launch-line.mjs';
import { flag } from '../args.mjs';

const NAME_RULE = /^[a-z0-9][a-z0-9-]{0,38}$/;

/** Matches the app's own --instance validation: the name becomes a directory. */
const assertName = (name) => {
  if (!name) throw new Error('Usage: npm run wt -- new <name> [--from <ref>] [--rom <file>] [--quick-slot <N>] [--no-build]');
  if (!NAME_RULE.test(name)) {
    throw new Error(`"${name}" is not a valid name. Use lowercase letters, digits and dashes, max 39 chars.`);
  }
};

// `--quick-slot` takes the 1-based "Slot N" shown in the save UI and converts it to
// the 0-based index `--auto-state=<number>` and `saveN.sav` use.
const resolveQuickSlot = (raw) => {
  if (raw == null) return null;
  const human = Number(raw);
  if (!Number.isInteger(human) || human < 1) {
    throw new Error(`--quick-slot must be a slot number ≥ 1 (the number shown in the save UI), got "${raw}".`);
  }
  return human - 1;
};

const assertBranchFree = (branch) => {
  // A clear message here beats letting `worktree add` fail cryptically.
  if (git(['rev-parse', '--verify', branch], repoRoot)) {
    throw new Error(`Branch ${branch} already exists. Pick another name, or: npm run wt -- clean <name>`);
  }
};

const addWorktree = (name, from) => {
  const path = worktreePath(name);
  const branch = branchFor(name);

  if (existsSync(path)) throw new Error(`${path} already exists.`);
  assertBranchFree(branch);

  mkdirSync(worktreeRoot, { recursive: true });
  fetchBase(repoRoot);
  const base = from ?? baseRef(repoRoot);

  console.log(`[wt] Creating ${path} on ${branch} from ${base}...`);
  execFileSync('git', ['worktree', 'add', '-b', branch, path, base], { cwd: repoRoot, stdio: 'inherit' });

  return { path, branch, baseCommit: git(['rev-parse', base], repoRoot) ?? base };
};

const run = async ({ positional, options }) => {
  const [name] = positional;
  assertName(name);

  const existing = await updateRegistry((registry) => findRecord(registry, name));
  if (existing) throw new Error(`"${name}" is already in the registry. Run: npm run wt -- list`);

  const { path, branch, baseCommit } = addWorktree(name, typeof options.from === 'string' ? options.from : null);
  const build = await bootstrapWorktree({ worktree: path, skipBuild: flag(options, 'no-build') });

  console.log('\n[wt] Provisioning the game profile...');
  const quickSlot = resolveQuickSlot(options['quick-slot']);
  const { romFile, savesCopied, fixturesCopied, quickSaveCopied } = await provisionProfile({
    name,
    romFile: typeof options.rom === 'string' ? options.rom : null,
    inheritConfigFrom: typeof options.from_profile === 'string' ? options.from_profile : null,
    quickSlot,
  });
  console.log(`  profile ${name} → ${romFile}`);
  console.log(`  ${savesCopied} named save state(s) copied (what --auto-state=<name> can load)`);
  if (fixturesCopied != null) {
    console.log(`  ${fixturesCopied} regression fixture(s) merged in from tests/fixtures/save-states/`);
  }
  if (quickSaveCopied) {
    console.log(`  quick slot ${quickSlot} copied. Load it with --auto-state=${quickSlot}`);
  }

  await updateRegistry((registry) => {
    const record = createRecord({ name, path, branch, baseCommit });
    record.build = build;
    registry.worktrees.push(record);
  });

  console.log(`\n[wt] ${name} is ready.`);
  console.log(`\nWorktree: ${path}`);
  console.log(`Branch:   ${branch}`);
  console.log(`Profile:  ${name}`);
  console.log(`\nLaunch:\n  ${launchLine(name)}`);
  console.log('\nClaim it for a session with:\n  npm run wt -- claim ' + name);
};

const command = {
  summary: 'Create a worktree, its branch and its profile (slow)',
  usage: 'npm run wt -- new <name> [--from <ref>] [--rom <file>] [--quick-slot <N>] [--no-build]',
  run,
};

export { command };
