/* @layer electron-main @kind logic */
/**
 * Finding the dataset files a kind's records live in.
 *
 * A create knows its destination (record-file-targets.ts). An update or delete
 * must not assume one: several collections were split by SIZE (junk items span
 * four files, one dungeon's checks two), so the canonical file may not hold the
 * id, or worse, an edit would land a second copy. An existing record is located
 * by its id across the kind's subtree, and null comes back when no file carries it.
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

// The record tree is synced in from the private companion repo, so every path
// record-file-targets.ts derives is relative to `records/`, not to the data
// folder as a whole. Without vault access there is nothing under here to edit.
const DATA_SEGMENTS = ['shared', 'game', 'data', 'records'] as const;

/** An absolute path inside shared/game/data/records/. */
const dataPath = (root: string, relative: string): string =>
  join(root, ...DATA_SEGMENTS, relative);

/** Every `.ts` file under a path, or that one file when the path already names it. */
const collectFiles = async (path: string): Promise<string[]> => {
  if (path.endsWith('.ts')) return [path];
  const entries = await readdir(path, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => {
    const child = join(path, entry.name);
    return entry.isDirectory() ? collectFiles(child) : Promise.resolve(entry.name.endsWith('.ts') ? [child] : []);
  }));
  return nested.flat();
};

/** Every `.ts` file under any of a kind's roots, each relative to shared/game/data/. */
const collectKindFiles = async (root: string, roots: readonly string[]): Promise<string[]> => {
  const nested = await Promise.all(roots.map(entry => collectFiles(dataPath(root, entry))));
  return nested.flat();
};

/** The file holding the record with this id, or null when no file carries it. */
const locateRecordFile = async (
  root: string,
  roots: readonly string[],
  id: string,
): Promise<string | null> => {
  const needle = `id: '${id.replace(/'/g, "\\'")}'`;
  for (const file of await collectKindFiles(root, roots)) {
    const content = await readFile(file, 'utf-8');
    if (content.includes(needle)) return file;
  }
  return null;
};

export { collectFiles, collectKindFiles, dataPath, DATA_SEGMENTS, locateRecordFile };
