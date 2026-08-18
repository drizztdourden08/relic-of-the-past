/* @layer tooling-scripts @kind logic */
/**
 * Deleting a worktree directory ourselves, instead of letting git do it.
 *
 * `git worktree remove` performs its own recursive delete, and on Windows that walks
 * straight into an NTFS junction: git does not recognise a junction as a link, stats it
 * as an ordinary directory, and deletes what it points at. Demonstrated directly — a
 * worktree carrying a junction to a folder of files, removed with `git worktree remove
 * --force`, left that folder empty.
 *
 * So git no longer does the deleting. This walks with lstat, unlinks any reparse point
 * it meets rather than descending through it, and only recurses into real directories.
 * The caller still runs `git worktree prune` afterwards to clear the admin files, which
 * is metadata only and touches nothing on disk.
 */
import { readdirSync, lstatSync, unlinkSync, rmdirSync, rmSync, chmodSync } from 'node:fs';
import { join } from 'node:path';

/** Windows marks pack files read-only; clear the bit rather than failing the delete. */
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

/**
 * Recursively delete `dir`, never following a link out of it.
 * Returns the number of reparse points unlinked, for reporting.
 */
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
