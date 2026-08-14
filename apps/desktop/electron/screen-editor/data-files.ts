/* @layer electron-main @kind logic */
/**
 * Finding the dataset files a kind's records actually live in.
 *
 * A create knows its destination from the record itself (record-file-targets.ts
 * derives one canonical path per kind). An UPDATE or a DELETE does not, and must
 * not assume one: several collections were split by SIZE rather than by anything
 * on the record — junk items span four files, enemies four, one dungeon's checks
 * two — so the file a record was created in is not the file the resolver would
 * pick for it today. Sending an edit to the canonical file would simply fail to
 * find the id, or worse, land a second copy beside the first.
 *
 * So an existing record is located by the id it already carries, scanning the
 * kind's own subtree. The id is the only thing matched on, exactly as in
 * source-writers.ts, and a record found in no file comes back as null rather
 * than as a guessed path.
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

/** Every `.ts` file under a path — or the path itself when it already names one. */
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
