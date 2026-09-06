/* @layer shared-storage @kind logic */
/**
 * Originals a converted file has taken over from, and the manifest re-pointed at the copies.
 *
 * A file is superseded when the pack also holds its stem in the target format, whichever way
 * round the two arrived; there is no record of a past conversion. The same rule decides what the
 * files list offers to throw out and where a reference moves, so the two cannot disagree.
 *
 * Matching is by stem, case-insensitively: a hand-written manifest can spell a name in a case
 * the disk does not and still play, and an exact-string re-point would leave it on the original.
 *
 * Both sides need this: main reconciles the manifest once the last converted file lands, and the
 * renderer moves every reference BEFORE an original is deleted, so removal never silences a slot.
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
 * A layer's file list with every superseded reference moved, or null when none was. A reference
 * to a file no longer on disk still moves if its stem is (a layer left behind by an earlier
 * removal). Two references landing on the same file collapse to one.
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

/** The manifest with every reference to a superseded original moved to its converted file. Returns the same object when nothing moved, so a caller can skip the write. */
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
