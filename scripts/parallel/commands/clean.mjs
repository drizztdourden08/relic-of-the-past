/* @layer tooling-scripts @kind logic */
import { rmSync, existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { updateRegistry } from '../registry.mjs';
import { surveyAll } from '../survey.mjs';
import { VERDICTS } from '../verdict.mjs';
import { gameDataPath, repoRoot } from '../paths.mjs';
import { parseDuration } from '../lease.mjs';
import { assertNoSharedLinks, unlinkSharedDirs } from '../link-deps.mjs';
import { removeTreeSafely } from '../remove-tree.mjs';
import { createSnapshot, verifyAgainst } from '../../safety/snapshot.mjs';
import { pruneSnapshots } from '../../safety/retention.mjs';
import { flag } from '../args.mjs';

const workReason = ({ status, assessment }, { merged }) => {
  if (assessment.verdict === VERDICTS.MISSING) return null;
  if (!assessment.deletable) {
    return assessment.verdict === VERDICTS.LEASED ? 'leased' : 'holds uncommitted or unlanded work';
  }
  if (merged && !status.merged) return 'branch has not landed on the base';
  return null;
};

const poolReason = ({ record, assessment }, { name, merged, staleMs, now }) => {
  if (staleMs !== null) return now - Date.parse(record.lastUsedAt) < staleMs ? 'used too recently' : null;
  if (!name && !merged && assessment.verdict === VERDICTS.READY) return 'unused and ready, so it stays warm in the pool';
  return null;
};

const sparedReason = (entry, criteria) => workReason(entry, criteria) ?? poolReason(entry, criteria);

const selectTargets = ({ entries, ...criteria }) => {
  const chosen = [];
  const spared = [];

  for (const entry of entries) {
    if (criteria.name && entry.record.name !== criteria.name) continue;
    const why = sparedReason(entry, criteria);
    if (why === null) chosen.push(entry);
    else spared.push({ entry, why });
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
    unlinkSharedDirs(record.path);
    assertNoSharedLinks(record.path);

    const links = removeTreeSafely(record.path);
    if (links > 0) console.log(`  [wt] unlinked ${links} link(s) without following them`);
    if (existsSync(record.path)) {
      console.warn(`  [wt] ${record.path} did not delete completely. Inspect it by hand.`);
    }
  }
  execFileSync('git', ['worktree', 'prune'], { cwd: repoRoot, stdio: 'ignore' });

  try {
    execFileSync('git', ['branch', '-D', record.branch], { cwd: repoRoot, stdio: 'ignore' });
  } catch {
    console.warn(`  [wt] Branch ${record.branch} was left in place (delete it by hand if unwanted).`);
  }

  const profileDir = gameDataPath('profiles', record.name);
  const profilePath = `${profileDir}/profile.json`;
  if (existsSync(profilePath)) {
    let automation;
    try {
      automation = JSON.parse(readFileSync(profilePath, 'utf8')).automation;
    } catch {
      automation = undefined;
    }
    if (automation === false) {
      console.warn(`  [wt] Profile at ${profileDir} is explicitly marked automation:false. Refusing to delete it.`);
      return;
    }
  }
  rmSync(profileDir, { recursive: true, force: true });
};

const parseStale = (staleRaw) => {
  if (staleRaw === undefined) return null;
  const staleMs = parseDuration(staleRaw);
  if (staleMs === null) throw new Error(`Unparseable --stale "${staleRaw}". Use forms like 12h, 7d.`);
  return staleMs;
};

const printPlan = (chosen) => {
  console.log('\nWould remove:');
  for (const entry of chosen) {
    console.log(`  ${describe(entry)}`);
    console.log(`    worktree ${entry.record.path}`);
    console.log(`    branch   ${entry.record.branch}`);
    console.log(`    profile  ${gameDataPath('profiles', entry.record.name)} (including its save states)`);
  }
};

const reportSnapshotCheck = (snapshot) => {
  const check = verifyAgainst(snapshot.ref);
  if (check.ok) {
    console.log('\n[wt] Verified: no protected file went missing.');
    return;
  }
  console.error(`\n[wt] STOP. This removal made ${check.missing.length} protected file(s) disappear:`);
  for (const path of check.missing.slice(0, 10)) console.error(`       ${path}`);
  if (check.missing.length > 10) console.error(`       ...and ${check.missing.length - 10} more`);
  console.error(`\n       Restore them with:  pnpm safety restore ${snapshot.ref}\n`);
  process.exitCode = 1;
};

const removeChosen = async (chosen) => {
  const snapshot = createSnapshot('wt-clean');
  console.log(`\n[wt] Safety snapshot ${snapshot.ref}`);

  for (const entry of chosen) {
    console.log(`\n[wt] Removing ${entry.record.name}...`);
    removeWorktree(entry.record);
  }

  reportSnapshotCheck(snapshot);

  const pruned = pruneSnapshots();
  if (pruned.length > 0) console.log(`[wt] Pruned ${pruned.length} expired snapshot(s).`);

  const names = new Set(chosen.map((e) => e.record.name));
  await updateRegistry((registry) => {
    registry.worktrees = registry.worktrees.filter((w) => !names.has(w.name));
  });

  console.log(`\n[wt] Removed ${names.size} worktree(s).`);
};

const run = async ({ positional, options }) => {
  const now = Date.now();
  const [name] = positional;
  const staleMs = parseStale(options.stale);

  const entries = surveyAll(now);
  if (entries.length === 0) {
    console.log('[wt] The pool is empty, so there is nothing to clean.');
    return;
  }

  const { chosen, spared } = selectTargets({ entries, name, merged: flag(options, 'merged'), staleMs, now });

  for (const { entry, why } of spared) {
    console.log(`keep   ${entry.record.name.padEnd(16)} ${why}`);
  }

  if (chosen.length === 0) {
    console.log('\n[wt] Nothing selected for removal.');
    if (name) console.log(`"${name}" is either leased or holds work. See the reason above.`);
    return;
  }

  printPlan(chosen);

  if (!flag(options, 'yes')) {
    console.log('\n[wt] Dry run. Re-run with --yes to remove the above.');
    return;
  }

  await removeChosen(chosen);
};

const command = {
  summary: 'Remove finished worktrees (dry run without --yes)',
  usage: 'pnpm wt clean [<name>] [--merged] [--stale 7d] [--yes]',
  run,
};

export { command };
