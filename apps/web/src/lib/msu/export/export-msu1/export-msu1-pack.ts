/* @layer renderer-lib @kind logic */
import type { MsuTrackDef } from '@shared/types/msu-manifest';
import { zipEntries } from '@shared/storage/archive-write';
import type { ZipEntry } from '@shared/storage/archive-write';
import { flattenTrack } from '../flatten-track';
import { writeMsu1Pcm } from '../write-pcm';
import type { ExportMsu1Params } from './export-msu1.type';
import { sanitizeStem } from './sanitize-stem';

const loadTrackBuffers = async (track: MsuTrackDef,
  loadBuffer: (fileName: string) => Promise<AudioBuffer | null>): Promise<Map<string, AudioBuffer>> => {
  const names = new Set(track.layers.flatMap((layer) => layer.files));
  const buffers = new Map<string, AudioBuffer>();
  for (const name of names) {
    const buffer = await loadBuffer(name);
    if (buffer) buffers.set(name, buffer);
  }
  return buffers;
};

const exportMsu1Pack = async (params: ExportMsu1Params): Promise<Uint8Array> => {
  const { manifest, loadBuffer, baseName, onProgress, seed } = params;

  const stem = sanitizeStem(baseName);
  const tracks = [...manifest.tracks].sort((a, b) => a.trackNum - b.trackNum);
  const entries: ZipEntry[] = [{ name: `${stem}.msu`, bytes: new Uint8Array(0) }];

  for (const [index, track] of tracks.entries()) {
    const buffers = await loadTrackBuffers(track, loadBuffer);
    const options = seed === undefined ? undefined : { seed: seed + track.trackNum };
    const { channels, loopSample } = await flattenTrack(track, buffers, options);
    if ((channels[0]?.length ?? 0) > 0) {
      entries.push({ name: `${stem}-${track.trackNum}.pcm`, bytes: writeMsu1Pcm(channels, loopSample) });
    }
    onProgress?.({ trackNum: track.trackNum, done: index + 1, total: tracks.length });
  }

  return zipEntries(entries, { store: true });
};

export { exportMsu1Pack };
