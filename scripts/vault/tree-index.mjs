/* @layer tooling-scripts @kind logic */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

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

const indexTree = (dir) => {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return {};
  return walk(dir, dir, {});
};

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
