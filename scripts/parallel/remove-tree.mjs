/* @layer tooling-scripts @kind logic */
import { readdirSync, lstatSync, unlinkSync, rmdirSync, rmSync, chmodSync } from 'node:fs';
import { join } from 'node:path';

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

const removeTreeSafely = (dir) => {
  let links = 0;
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return links;
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
      try {
        unlinkSync(full);
      } catch {
        try { rmdirSync(full); } catch { }
      }
      links += 1;
      continue;
    }
    if (stat.isDirectory()) {
      links += removeTreeSafely(full);
      try { rmdirSync(full); } catch { }
      continue;
    }
    forceUnlink(full);
  }

  try { rmdirSync(dir); } catch { }
  return links;
};

export { removeTreeSafely };
