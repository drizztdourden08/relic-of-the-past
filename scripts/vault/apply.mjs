/* @layer tooling-scripts @kind logic */
/**
 * Writing one side of the comparison onto the other, and committing the vault
 * when it is the side that changed.
 *
 * The vault is the maintainer's own checkout, so this commits on whatever branch
 * is already out — it never creates a branch, never switches one, and never
 * pushes. Sending the commit on is a decision made by a person; leaving it
 * committed locally means the working tree stays clean and the next comparison
 * starts from a state that is actually recorded.
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

const copy = (from, to) => {
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
};

const remove = (path) => {
  if (existsSync(path)) rmSync(path, { force: true });
};

/**
 * Apply every entry that has a direction. `pull` writes the vault's copy into
 * the repo, `push` writes the repo's copy into the vault; a `*-deleted` status
 * removes on the receiving side instead.
 */
const applyEntries = ({ entries, root, treeDir }) => {
  const applied = { pulled: 0, pushed: 0, removed: 0 };

  for (const entry of entries) {
    if (!entry.direction) continue;
    const localPath = join(root, entry.path);
    const vaultPath = join(treeDir, entry.path);

    if (entry.direction === 'pull') {
      if (entry.status === 'remote-deleted') {
        remove(localPath);
        applied.removed += 1;
      } else {
        copy(vaultPath, localPath);
        applied.pulled += 1;
      }
    } else if (entry.status === 'local-deleted') {
      remove(vaultPath);
      applied.removed += 1;
    } else {
      copy(localPath, vaultPath);
      applied.pushed += 1;
    }
  }

  return applied;
};

const run = (args, cwd) =>
  execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

/**
 * Commit whatever the apply step wrote into the vault. Returns the short hash,
 * or null when there was nothing to record.
 */
const commitVault = (vaultDir, subject) => {
  if (run(['status', '--porcelain'], vaultDir).trim() === '') return null;
  run(['add', '-A'], vaultDir);
  run(['commit', '-q', '-m', subject], vaultDir);
  return run(['rev-parse', '--short', 'HEAD'], vaultDir).trim();
};

export { applyEntries, commitVault };
