/* @layer electron-main @kind logic */
/**
 * Which of an archive's audio files actually belong to the pack.
 *
 * An MSU pack is flat by construction: the filename carries the track number, so every track sits
 * beside its siblings. Anything an archive keeps in a SUBFOLDER is therefore not a track — it is
 * the extras packs ship with, most often alternate takes offered as a swap. Copying those in by
 * basename, which is what a plain recursive walk leads to, puts two files on one slot: either they
 * collide on the name and one silently overwrites the other, or they differ and both claim the
 * track, leaving which one plays down to directory order.
 *
 * So the rule is depth, not name: keep the shallowest level that has audio in it and drop the rest.
 * That reads a pack at the archive root and a pack nested one folder down — both common — without
 * having to know which of the two it was given.
 *
 * Track numbers are then made unique as a backstop. Two files can claim one slot without either
 * being in a subfolder (a pack shipping both `alttp_msu-3.pcm` and `something-3.pcm`), and a slot
 * that plays one of two files depending on how the disk lists them is not something to leave in.
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

/** How many separators deep a path is — only ever compared against its siblings. */
const depthOf = (path: string): number => dirname(path).split(/[\/]/).length;

const selectPackFiles = (files: string[]): PackSelection => {
  if (files.length === 0) return { files: [], nested: [], duplicates: [] };

  const top = Math.min(...files.map(depthOf));
  const nested = files.filter((file) => depthOf(file) > top);

  const kept: string[] = [];
  const duplicates: string[] = [];
  const claimed = new Set<number>();
  // Sorted so the winner of a contested slot is decided by the name, not by the order a directory
  // happened to be read in — the same archive has to import the same way twice.
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
