/* @layer tooling-scripts @kind logic */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { readRegistry, updateRegistry } from '../registry.mjs';
import { surveyAll } from '../survey.mjs';
import { isExpired } from '../lease.mjs';
import { resyncCopiedFiles } from '../link-deps.mjs';
import { gameDataPath, repoRoot, worktreeRoot } from '../paths.mjs';
import { flag } from '../args.mjs';

const orphanProfiles = () => {
  const known = new Set(readRegistry().worktrees.map((w) => w.name));
  const dir = gameDataPath('profiles');
  if (!existsSync(dir)) return [];

  return readdirSync(dir).filter((id) => {
    if (known.has(id)) return false;
    try {
      const profile = JSON.parse(readFileSync(gameDataPath('profiles', id, 'profile.json'), 'utf8'));
      return typeof profile.name === 'string' && profile.name.startsWith('agent/');
    } catch {
      return false;
    }
  });
};

const resyncPresent = (entries) => {
  for (const { record, status } of entries) {
    if (status.missing) continue;
    const results = resyncCopiedFiles(record.path);
    const copied = results.filter((r) => r.action === 'copied').map((r) => r.name);
    if (copied.length > 0) console.log(`${record.name}: re-synced ${copied.join(', ')}`);
  }
};

const repairRegistry = async (missing, expired) => {
  if (missing.length > 0 || expired.length > 0) {
    await updateRegistry((registry) => {
      registry.worktrees = registry.worktrees.filter((w) => !missing.includes(w.name));
      for (const w of registry.worktrees) {
        if (isExpired(w.lease)) w.lease = null;
      }
    });
  }

  if (missing.length > 0) console.log(`Dropped ${missing.length} record(s) with no checkout: ${missing.join(', ')}`);
  if (expired.length > 0) console.log(`Released ${expired.length} expired lease(s): ${expired.join(', ')}`);
};

const reportOrphans = () => {
  const orphans = orphanProfiles();
  if (orphans.length > 0) {
    console.log(`\nProfiles with no registry record: ${orphans.join(', ')}`);
    console.log('Left in place. Remove one by hand if it is not yours:');
    for (const id of orphans) console.log(`  ${gameDataPath('profiles', id)}`);
  }
  return orphans;
};

const run = async ({ options }) => {
  console.log(`[wt] Pool root: ${worktreeRoot}\n`);

  execFileSync('git', ['worktree', 'prune'], { cwd: repoRoot, stdio: 'ignore' });

  const entries = surveyAll();
  const missing = entries.filter((e) => e.status.missing).map((e) => e.record.name);
  const expired = entries.filter((e) => isExpired(e.record.lease)).map((e) => e.record.name);

  resyncPresent(entries);
  await repairRegistry(missing, expired);
  const orphans = reportOrphans();

  if (missing.length === 0 && expired.length === 0 && orphans.length === 0) {
    console.log('Nothing to repair.');
  }

  if (flag(options, 'verbose')) {
    console.log(`\n${entries.length} record(s) in the registry.`);
  }
};

const command = {
  summary: 'Reconcile the registry with what is on disk',
  usage: 'pnpm wt doctor [--verbose]',
  run,
};

export { command };
