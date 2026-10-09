/* @layer electron-main @kind logic */
import { rm, stat } from 'fs/promises';
import type { OptimizeConversion, OptimizeRunResult } from '@shared/types/msu-optimize';
import type { MsuPackManifest } from '@rotp/game-data';
import { withFileRenamed, withLoopSampleCarried } from '@shared/storage/msu-layer-edit';
import { withSupersededRepointed } from '@shared/storage/msu-superseded';
import { errMessage } from '../../lib/result';
import { synthesizeClassicManifest } from '@shared/storage/msu-classic-manifest';
import { trackNumberOf } from '@shared/storage/msu-paths';
import { packFilePath, readPackManifest, refuseInstalledPack, writePackManifest } from '../pack-fs';
import { describeSource } from './audio-source';
import { encodeToTarget } from './flac-encode';
import { readLoopSample } from './loop-point';
import { freeTargetName, listPackAudio, pendingConversions } from './pack-audio';
import { NO_MANIFEST } from './run.constants';
import type { RunRequest } from './run.type';

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
  const { pack, tools, fileNames, report } = request;
  await refuseInstalledPack(pack);

  const audio = await listPackAudio(pack);
  const sizes = new Map(audio.map((file) => [file.name, file.sizeBytes]));
  const manifest = await manifestToEdit(pack, [...sizes.keys()]);
  const pending = new Set(pendingConversions(audio).map((file) => file.name));
  const wanted = fileNames.filter((name) => pending.has(name));
  const taken = new Set(sizes.keys());

  const { manifest: carriedManifest, carried } = await carryLoopPoints(pack, wanted, manifest);
  let working = carriedManifest;
  await writePackManifest(pack, working);

  const converted: OptimizeConversion[] = [];
  const failed: Array<{ name: string; reason: string }> = [];

  for (const [index, name] of wanted.entries()) {
    const step = { pack, phase: 'convert' as const, index: index + 1, total: wanted.length, fileName: name };
    report(step);
    const sourcePath = packFilePath(pack, name);
    const source = await describeSource(tools, sourcePath, name, sizes.get(name) ?? 0);
    if (source === null) {
      failed.push({ name, reason: 'No decoder could read this file.' });
      continue;
    }
    const outputName = freeTargetName(name, taken);
    const destPath = packFilePath(pack, outputName);
    try {
      await encodeToTarget(tools, {
        inputArgs: source.inputArgs,
        sourcePath,
        destPath,
        durationSeconds: source.durationSeconds,
        onProgress: (fileFraction) => { report({ ...step, fileFraction }); },
      });
      converted.push({ name, outputName, bytes: (await stat(destPath)).size });
      taken.add(outputName);
      working = withFileRenamed(working, name, outputName);
      await writePackManifest(pack, working);
    } catch (err) {
      await rm(destPath, { force: true }).catch(() => {});
      failed.push({ name, reason: errMessage(err) });
    }
  }

  const reconciled = withSupersededRepointed(working, [...taken]);
  if (reconciled !== working) await writePackManifest(pack, reconciled);

  return { converted, failed, loopPointsCarried: carried };
};

export { convertPack };
export type { RunRequest };
