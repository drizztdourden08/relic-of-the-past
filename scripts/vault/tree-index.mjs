/* @layer tooling-scripts @kind logic */
/**
 * A content index of one side of the sync: repo-relative path → sha256. Content, not
 * mtimes: the old mtime sync could not tell an edit from a touch, or a file added here
 * from one deleted there.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/** Directories that are never part of the mirrored tree, on either side. */
const IGNORED = new Set(['.git', 'node_modules', '.DS_Store', 'Thumbs.db']);

const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

const walk = (dir, base, into) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, base, into);
    else if (entry.isFile()) into[relative(base, full).split('\\').join('/')] = sha256(full);
  }
  return into;
};

/** Index everything under `dir`, keyed by relative path. A missing directory indexes as empty. */
const indexTree = (dir) => {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return {};
  return walk(dir, dir, {});
};

/** Index only the given repo-relative paths (file or directory), never the whole working tree. */
const indexPaths = (root, paths) => {
  const index = {};
  for (const path of paths) {
    const full = join(root, path);
    if (!existsSync(full)) continue;
    if (statSync(full).isDirectory()) {
      for (const [rel, hash] of Object.entries(walk(full, full, {}))) index[`${path}/${rel}`] = hash;
    } else index[path] = sha256(full);
  }
  return index;
};

export { indexTree, indexPaths, sha256 };
