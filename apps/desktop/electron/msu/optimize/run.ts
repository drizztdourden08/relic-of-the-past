/* @layer electron-main @kind logic */
/**
 * The conversion itself, in the one order that keeps a pack playable.
 *
 * 1. REPEAT POINTS FIRST. An MSU-1 file states where it loops from in its own header, and that
 *    header dies with the container. So every point is read and written into the layer that
 *    plays it, and the manifest is saved, BEFORE a single byte is encoded — get the order wrong
 *    and every intro-then-loop track silently starts repeating from zero.
 * 2. Encode one file at a time, and RE-POINT the manifest at the new name as each one lands.
 *    A manifest still naming `foo.pcm` after `foo.flac` appeared silences every slot built on
 *    it, so the write happens per file rather than once at the end: an interrupted run leaves a
 *    pack that is consistent as far as it got.
 * 3. RECONCILE once the last file lands. Every reference to a superseded original — one whose
 *    stem the pack now holds in the target format — is moved to the converted file, whether it
 *    was missed above (a name the manifest spells in another case) or left over from an earlier
 *    run. The per-file re-point is the fast path; this is the guarantee.
 * 4. Originals are KEPT. This converts and stops; throwing the superseded files out is a
 *    separate, confirmed action on the pack's files.
 *
 * A pack with no manifest is PROMOTED to one before anything is converted, rather than refused.
 * Its filenames are its wiring, and the wiring is what a format change disturbs — so the
 * synthesized view of it (one slot per numbered file, the same view the player already uses) is
 * written down first. After that the pack has a real manifest, the repeat points have somewhere to
 * live, and the rename is a manifest edit like any other. Refusing instead would leave the one
 * kind of pack most worth converting, a folder of uncompressed audio, as the one kind that cannot
 * be.
 */
import { rm, stat } from 'fs/promises';
import type { OptimizeConversion, OptimizeRunResult } from '@shared/types/msu-optimize';
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import { withFileRenamed, withLoopSampleCarried } from '@shared/storage/msu-layer-edit';
import { withSupersededRepointed } from '@shared/storage/msu-superseded';
import { errMessage } from '../../lib/result';
import { synthesizeClassicManifest } from '@shared/storage/msu-classic-manifest';
import { trackNumberOf } from '@shared/storage/msu-paths';
import { packFilePath, readPackManifest, writePackManifest } from '../pack-fs';
import { describeSource } from './audio-source';
import { encodeToTarget } from './flac-encode';
import { readLoopSample } from './loop-point';
import type { ProgressReporter } from './analyze';
import { freeTargetName, listPackAudio, pendingConversions } from './pack-audio';

interface RunRequest {
  pack: string;
  ffmpegPath: string;
  /** The files to convert, as named by the preview the user approved. */
  fileNames: string[];
  report: ProgressReporter;
}

/** Nothing here is addressable: no manifest, and no filename carries a track number either. */
const NO_MANIFEST = 'Nothing in this pack is wired to a slot, so there is nothing to convert.';

/**
 * Step 1: every repeat point moved into the manifest, before any format changes.
 *
 * The header magic is the format check — a file that does not carry one answers null, so an
 * encoded source simply has nothing to move.
 */
const carryLoopPoints = async (
  pack: string, fileNames: string[], manifest: MsuPackManifest,
): Promise<{ manifest: MsuPackManifest; carried: number }> => {
  let working = manifest;
  let carried = 0;
  for (const name of fileNames) {
    const loopSample = await readLoopSample(packFilePath(pack, name));
    if (loopSample === null) continue;
    working = withLoopSampleCarried(working, name, loopSample);
    carried += 1;
  }
  return { manifest: working, carried };
};

/**
 * The pack's manifest, writing one down first if it has none.
 *
 * The synthesized manifest is the same one the player builds for a classic pack at load time, so
 * promoting changes nothing about how the pack sounds — it only gives the conversion a place to
 * record what it learns.
 */
const manifestToEdit = async (pack: string, names: string[]): Promise<MsuPackManifest> => {
  const existing = await readPackManifest(pack);
  if (existing !== null) return existing;

  const tracks = names
    .map((fileName) => ({ fileName, trackNum: trackNumberOf(fileName) }))
    .filter((track): track is { fileName: string; trackNum: number } => track.trackNum !== null);
  if (tracks.length === 0) throw new Error(NO_MANIFEST);
  return synthesizeClassicManifest(pack, tracks);
};

const convertPack = async (request: RunRequest): Promise<OptimizeRunResult> => {
  const { pack, ffmpegPath, fileNames, report } = request;

  const audio = await listPackAudio(pack);
  const sizes = new Map(audio.map((file) => [file.name, file.sizeBytes]));
  const manifest = await manifestToEdit(pack, [...sizes.keys()]);
  // A name the preview listed but a previous run already covered is skipped, not re-encoded:
  // the reconciliation at the end moves its reference onto the copy that exists.
  const pending = new Set(pendingConversions(audio).map((file) => file.name));
  const wanted = fileNames.filter((name) => pending.has(name));
  const taken = new Set(sizes.keys());

  const { manifest: carriedManifest, carried } = await carryLoopPoints(pack, wanted, manifest);
  let working = carriedManifest;
  await writePackManifest(pack, working);

  const converted: OptimizeConversion[] = [];
  const failed: Array<{ name: string; reason: string }> = [];

  for (const [index, name] of wanted.entries()) {
    report({ pack, phase: 'convert', index: index + 1, total: wanted.length, fileName: name });
    const sourcePath = packFilePath(pack, name);
    const source = await describeSource(sourcePath, name, sizes.get(name) ?? 0);
    if (source === null) {
      failed.push({ name, reason: 'No decoder could read this file.' });
      continue;
    }
    const outputName = freeTargetName(name, taken);
    const destPath = packFilePath(pack, outputName);
    try {
      await encodeToTarget(ffmpegPath, { inputArgs: source.inputArgs, sourcePath, destPath });
      converted.push({ name, outputName, bytes: (await stat(destPath)).size });
      taken.add(outputName);
      working = withFileRenamed(working, name, outputName);
      await writePackManifest(pack, working);
    } catch (err) {
      // A half-written output is worse than none: it would look like a converted file.
      await rm(destPath, { force: true }).catch(() => {});
      failed.push({ name, reason: errMessage(err) });
    }
  }

  // Step 3: whatever the per-file re-point missed, the pack's own file list settles.
  const reconciled = withSupersededRepointed(working, [...taken]);
  if (reconciled !== working) await writePackManifest(pack, reconciled);

  return { converted, failed, loopPointsCarried: carried };
};

export { NO_MANIFEST, convertPack };
export type { RunRequest };
