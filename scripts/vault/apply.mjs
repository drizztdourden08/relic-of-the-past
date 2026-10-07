/* @layer tooling-scripts @kind logic */
/**
 * Writes one side of the comparison onto the other and commits the vault when it
 * changed. Commits on whatever branch is checked out; never creates or switches a
 * branch, never pushes. Sending the commit on is a person's decision.
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

/** `pull` writes vault → repo, `push` writes repo → vault; `*-deleted` removes on the receiving side. */
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

/** Commit what the apply step wrote into the vault. Returns the short hash, or null when nothing changed. */
const commitVault = (vaultDir, subject) => {
  if (run(['status', '--porcelain'], vaultDir).trim() === '') return null;
  run(['add', '-A'], vaultDir);
  run(['commit', '-q', '-m', subject], vaultDir);
  return run(['rev-parse', '--short', 'HEAD'], vaultDir).trim();
};

export { applyEntries, commitVault };
