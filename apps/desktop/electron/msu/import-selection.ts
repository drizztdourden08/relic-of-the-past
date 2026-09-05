/* @layer electron-main @kind logic */
/**
 * Which of an archive's audio files belong to the pack.
 *
 * An MSU pack is flat: the filename carries the track number. Anything in a SUBFOLDER is an
 * extra (usually alternate takes), and a recursive walk copying by basename would put two
 * files on one slot. So the rule is depth: keep the shallowest level that has audio. That
 * reads a pack at the archive root and one nested a folder down alike.
 *
 * Track numbers are then made unique as a backstop: two files at the same level can still
 * claim one slot, and which one plays must not depend on directory order.
 */
import { dirname, basename } from 'path';
import { trackNumberOf } from '@shared/storage/msu-paths';

interface PackSelection {
  /** The files to copy in, at most one per track number. */
  files: string[];
  /** Files left behind because they sit below the pack's own level, with the reason implied. */
  nested: string[];
  /** Files left behind because an earlier file already claimed their track number. */
  duplicates: string[];
}

/** How many separators deep a path is. Only meaningful next to its siblings. */
const depthOf = (path: string): number => dirname(path).split(/[\/]/).length;

const selectPackFiles = (files: string[]): PackSelection => {
  if (files.length === 0) return { files: [], nested: [], duplicates: [] };

  const top = Math.min(...files.map(depthOf));
  const nested = files.filter((file) => depthOf(file) > top);

  const kept: string[] = [];
  const duplicates: string[] = [];
  const claimed = new Set<number>();
  // Sorted so a contested slot is decided by name, not directory order: the same archive
  // has to import the same way twice.
  for (const file of files.filter((file) => depthOf(file) === top).sort()) {
    const track = trackNumberOf(basename(file));
    if (track !== null && claimed.has(track)) { duplicates.push(file); continue; }
    if (track !== null) claimed.add(track);
    kept.push(file);
  }

  return { files: kept, nested, duplicates };
};

export { selectPackFiles };
export type { PackSelection };
