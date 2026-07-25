/* @layer tooling-scripts @kind logic */
/**
 * `wt clean` — remove worktrees that are finished with.
 *
 * Deliberately hard to misuse, because the failure mode is destroying work:
 *   - it is a DRY RUN unless --yes is passed;
 *   - anything holding uncommitted or unlanded commits is refused outright, never
 *     "cleaned anyway" — landing or discarding that work is a person's decision;
 *   - a leased worktree is left alone;
 *   - it prints exactly what would go, including the save data, before doing it.
 *
 * Removing a worktree also removes its game profile, and with it that profile's save
 * states. The user's own profiles are never candidates — only ids in the registry.
 */
import { rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { updateRegistry } from '../registry.mjs';
import { surveyAll } from '../survey.mjs';
import { VERDICTS } from '../verdict.mjs';
import { gameDataPath, repoRoot } from '../paths.mjs';
import { parseDuration } from '../lease.mjs';
import { assertNoSharedLinks, unlinkSharedDirs } from '../link-deps.mjs';
import { flag } from '../args.mjs';

/** Which records the given switches select, and why each other one is spared. */
const selectTargets = ({ entries, name, merged, staleMs, now }) => {
  const chosen = [];
  const spared = [];

  for (const entry of entries) {
    const { record, status, assessment } = entry;

    if (name && record.name !== name) continue;

    if (!assessment.deletable && assessment.verdict !== VERDICTS.MISSING) {
      const why = assessment.verdict === VERDICTS.LEASED ? 'leased' : 'holds uncommitted or unlanded work';
      spared.push({ entry, why });
      continue;
    }
    if (merged && !status.merged && assessment.verdict !== VERDICTS.MISSING) {
      spared.push({ entry, why: 'branch has not landed on the base' });
      continue;
    }
    if (staleMs !== null && now - Date.parse(record.lastUsedAt) < staleMs) {
      spared.push({ entry, why: 'used too recently' });
      continue;
    }
    // With no selector at all, only obviously-finished worktrees are offered.
    if (!name && !merged && staleMs === null && assessment.verdict === VERDICTS.READY) {
      spared.push({ entry, why: 'unused and ready — keeping it warm in the pool' });
      continue;
    }
    chosen.push(entry);
  }

  return { chosen, spared };
};

const describe = ({ record, status, assessment }) => {
  const bits = [`${record.name} (${assessment.verdict})`];
  if (!status.missing) bits.push(status.merged ? 'merged' : 'not merged');
  if (record.pr) bits.push(`PR #${record.pr.number}`);
  bits.push(`${record.notes?.length ?? 0} prompt(s)`);
  return bits.join(' · ');
};

const removeWorktree = (record) => {
  if (existsSync(record.path)) {
    // Detach the junctions FIRST, and refuse to go further if any survives. A recursive
    // delete walks into a junction and destroys the main repo's directory instead of the
    // link — with .claude linked, that empties the real skills, tools and settings.
    unlinkSharedDirs(record.path);
    assertNoSharedLinks(record.path);

    try {
      execFileSync('git', ['worktree', 'remove', '--force', record.path], { cwd: repoRoot, stdio: 'inherit' });
    } catch {
      console.warn(`  [wt] git could not remove ${record.path} — deleting the directory.`);
      rmSync(record.path, { recursive: true, force: true });
    }
  }
  execFileSync('git', ['worktree', 'prune'], { cwd: repoRoot, stdio: 'ignore' });

  try {
    execFileSync('git', ['branch', '-D', record.branch], { cwd: repoRoot, stdio: 'ignore' });
  } catch {
    console.warn(`  [wt] Branch ${record.branch} was left in place (delete it by hand if unwanted).`);
  }

  // The profile id is the worktree name, so this only ever touches an agent profile.
  rmSync(gameDataPath('profiles', record.name), { recursive: true, force: true });
};

const run = async ({ positional, options }) => {
  const now = Date.now();
  const [name] = positional;
  const staleRaw = options.stale;
  const staleMs = staleRaw === undefined ? null : parseDuration(staleRaw);
  if (staleRaw !== undefined && staleMs === null) {
    throw new Error(`Unparseable --stale "${staleRaw}". Use forms like 12h, 7d.`);
  }

  const entries = surveyAll(now);
  if (entries.length === 0) {
    console.log('[wt] Nothing to clean — the pool is empty.');
    return;
  }

  const { chosen, spared } = selectTargets({ entries, name, merged: flag(options, 'merged'), staleMs, now });

  for (const { entry, why } of spared) {
    console.log(`keep   ${entry.record.name.padEnd(16)} ${why}`);
  }

  if (chosen.length === 0) {
    console.log('\n[wt] Nothing selected for removal.');
    if (name) console.log(`"${name}" is either leased or holds work — see the reason above.`);
    return;
  }

  console.log('\nWould remove:');
  for (const entry of chosen) {
    console.log(`  ${describe(entry)}`);
    console.log(`    worktree ${entry.record.path}`);
    console.log(`    branch   ${entry.record.branch}`);
    console.log(`    profile  ${gameDataPath('profiles', entry.record.name)} (including its save states)`);
  }

  if (!flag(options, 'yes')) {
    console.log('\n[wt] Dry run. Re-run with --yes to remove the above.');
    return;
  }

  for (const entry of chosen) {
    console.log(`\n[wt] Removing ${entry.record.name}…`);
    removeWorktree(entry.record);
  }

  const names = new Set(chosen.map((e) => e.record.name));
  await updateRegistry((registry) => {
    registry.worktrees = registry.worktrees.filter((w) => !names.has(w.name));
  });

  console.log(`\n[wt] Removed ${names.size} worktree(s).`);
};

const command = {
  summary: 'Remove finished worktrees (dry run without --yes)',
  usage: 'npm run wt -- clean [<name>] [--merged] [--stale 7d] [--yes]',
  run,
};

export { command };
