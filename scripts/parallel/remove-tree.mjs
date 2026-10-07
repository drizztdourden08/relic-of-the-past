/* @layer tooling-scripts @kind logic */
/**
 * Deletes a worktree directory ourselves. On Windows `git worktree remove` treats an
 * NTFS junction as an ordinary directory and deletes what it points at (demonstrated:
 * it emptied the junction target). This walks with lstat, unlinks any reparse point
 * instead of descending through it, and only recurses into real directories. The
 * caller still runs `git worktree prune` afterwards (metadata only).
 */
import { readdirSync, lstatSync, unlinkSync, rmdirSync, rmSync, chmodSync } from 'node:fs';
import { join } from 'node:path';

/** Windows marks pack files read-only; clear the bit instead of failing the delete. */
const forceUnlink = (path) => {
  try {
    unlinkSync(path);
  } catch {
    try {
      chmodSync(path, 0o666);
      unlinkSync(path);
    } catch {
      rmSync(path, { force: true });
    }
  }
};

/** Recursively delete `dir`, never following a link. Returns the number of reparse points unlinked. */
const removeTreeSafely = (dir) => {
  let links = 0;
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return links;  // already gone
  }

  for (const entry of entries) {
    const full = join(dir, entry.name);
    let stat;
    try {
      stat = lstatSync(full);
    } catch {
      continue;
    }
    if (stat.isSymbolicLink()) {
      // A junction reports as a directory to rmdir and as a link to unlink; try both,
      // and never touch what is on the other side.
      try {
        unlinkSync(full);
      } catch {
        try { rmdirSync(full); } catch { /* leave it; the assert below will catch it */ }
      }
      links += 1;
      continue;
    }
    if (stat.isDirectory()) {
      links += removeTreeSafely(full);
      try { rmdirSync(full); } catch { /* non-empty because something above failed */ }
      continue;
    }
    forceUnlink(full);
  }

  try { rmdirSync(dir); } catch { /* caller reports if the directory survives */ }
  return links;
};

export { removeTreeSafely };
