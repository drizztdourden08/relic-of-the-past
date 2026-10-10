/* @layer electron-main @kind logic */
import { dirname, basename } from 'path';
import { trackNumberOf } from '@rotp/msu';
import type { PackSelection } from './import-selection.type';

const depthOf = (path: string): number => dirname(path).split(/[/]/).length;

const selectPackFiles = (files: string[]): PackSelection => {
  if (files.length === 0) return { files: [], nested: [], duplicates: [] };

  const top = Math.min(...files.map(depthOf));
  const nested = files.filter((file) => depthOf(file) > top);

  const kept: string[] = [];
  const duplicates: string[] = [];
  const claimed = new Set<number>();
  const topLevelByName = files.filter((file) => depthOf(file) === top).sort();
  for (const file of topLevelByName) {
    const track = trackNumberOf(basename(file));
    if (track !== null && claimed.has(track)) { duplicates.push(file); continue; }
    if (track !== null) claimed.add(track);
    kept.push(file);
  }

  return { files: kept, nested, duplicates };
};

export { selectPackFiles };
export type { PackSelection };
