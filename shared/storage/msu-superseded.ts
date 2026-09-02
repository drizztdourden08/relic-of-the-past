/* @layer shared-storage @kind logic */
/**
 * Originals a converted file has taken over from, and the manifest re-pointed at the converted
 * copies.
 *
 * A file is superseded when the pack also holds its stem in the target format, whichever way round
 * the two arrived — there is no record of a past conversion, and there does not need to be. The
 * same rule decides both what the files list offers to throw out and where a reference is moved
 * to, so the two can never disagree about which file a slot ends up playing.
 *
 * Matching is by stem, case-insensitively. A manifest written by hand can spell a name in a case
 * the disk does not, and on a case-insensitive filesystem it plays fine that way — so a re-point
 * keyed on the exact string would leave such a reference on the original while the file beside it
 * went unheard.
 *
 * Both sides need this: the conversion in the main process reconciles the manifest once the last
 * file lands, and the files list in the renderer moves every remaining reference BEFORE an original
 * is deleted, so removing the superseded halves can never silence a slot.
 */
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import { OPTIMIZE_TARGET_EXTENSION } from '@shared/types/msu-optimize';
import { mapLayers } from './msu-layer-edit';

const extensionOf = (name: string): string => {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
};

const stemKey = (name: string): string => {
  const dot = name.lastIndexOf('.');
  return (dot > 0 ? name.slice(0, dot) : name).toLowerCase();
};

const isTargetFormat = (name: string): boolean => extensionOf(name) === OPTIMIZE_TARGET_EXTENSION;

/** The target-format file for each stem the pack holds one for. */
const targetsByStem = (names: string[]): Map<string, string> => {
  const out = new Map<string, string>();
  for (const name of names) if (isTargetFormat(name)) out.set(stemKey(name), name);
  return out;
};

/** Every original → the converted file that has taken over from it. */
const supersededMap = (names: string[]): Map<string, string> => {
  const targets = targetsByStem(names);
  const out = new Map<string, string>();
  for (const name of names) {
    if (isTargetFormat(name)) continue;
    const target = targets.get(stemKey(name));
    if (target !== undefined) out.set(name, target);
  }
  return out;
};

/**
 * A layer's file list with every superseded reference moved, or null when none was.
 *
 * A reference to a file that is no longer on disk still moves, as long as its stem is: that is a
 * layer left behind by an earlier removal, and re-pointing it is the repair. Two references that
 * land on the same file collapse to one — a layer that named both halves of a pair was only ever
 * playing one body of audio.
 */
const repointFiles = (files: string[], targets: Map<string, string>): string[] | null => {
  let changed = false;
  const moved: string[] = [];
  for (const file of files) {
    const target = isTargetFormat(file) ? undefined : targets.get(stemKey(file));
    const next = target ?? file;
    if (next !== file) changed = true;
    if (moved.includes(next)) { changed = true; continue; }
    moved.push(next);
  }
  return changed ? moved : null;
};

/**
 * The manifest with every reference to a superseded original moved to its converted file.
 * Answers the very same object when nothing needed moving, so a caller can skip the write.
 */
const withSupersededRepointed = (manifest: MsuPackManifest, names: string[]): MsuPackManifest => {
  const targets = targetsByStem(names);
  if (targets.size === 0) return manifest;
  let changed = false;
  const next = mapLayers(manifest, (layer) => {
    const files = repointFiles(layer.files, targets);
    if (files === null) return layer;
    changed = true;
    return { ...layer, files };
  });
  return changed ? next : manifest;
};

export { supersededMap, withSupersededRepointed };
