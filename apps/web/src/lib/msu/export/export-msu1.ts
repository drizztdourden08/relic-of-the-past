/* @layer renderer-lib @kind logic */
/**
 * Exports a pack as a plain MSU-1 set, for players that are not this app.
 *
 * The naming is the SD2SNES convention — `<baseName>.msu` plus `<baseName>-<track>.pcm` — which
 * is what snes9x 1.55+, bsnes/higan, the FXPak/SD2SNES and MiSTer all look for. The `.msu` file
 * is genuinely empty: it exists as the marker that says "this ROM has MSU-1 audio beside it",
 * and carries no data of its own.
 *
 * Layers cannot survive the trip (MSU-1 is one stream), so every track is flattened first — see
 * ./flatten-track for what that costs and how it stays reproducible.
 */
import type { MsuPackManifest, MsuTrackDef } from '@shared/types/msu-manifest';
import { zipEntries } from '@shared/storage/archive-write';
import type { ZipEntry } from '@shared/storage/archive-write';
import { flattenTrack } from './flatten-track';
import { writeMsu1Pcm } from './write-pcm';

interface Msu1ExportProgress {
  /** The track just written. */
  trackNum: number;
  /** Tracks finished so far, out of the pack's total. */
  done: number;
  total: number;
}

interface ExportMsu1Params {
  manifest: MsuPackManifest;
  /** Fetches and decodes one file named by the manifest; null when the pack no longer has it. */
  loadBuffer: (fileName: string) => Promise<AudioBuffer | null>;
  /** Filename stem the whole set shares, usually the ROM's own basename. */
  baseName: string;
  /** Called after each track — a real pack takes minutes, so this is not optional in practice. */
  onProgress?: (progress: Msu1ExportProgress) => void;
  /** Overrides the per-track flatten seed. Only useful for deliberately re-rolling a mix. */
  seed?: number;
}

/** The stem becomes a filename, and a manifest is user-authored, so path characters go. */
const sanitizeStem = (baseName: string): string => {
  const cleaned = baseName.replace(/[\\/:*?"<>|]/g, '').trim();
  return cleaned.length > 0 ? cleaned : 'pack';
};

/** One decode per distinct filename, however many layers of the track happen to name it. */
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
    // A track whose files are all missing is skipped: an 8-byte header-only .pcm would look
    // like a real track to a player and give silence instead of an obvious gap.
    if ((channels[0]?.length ?? 0) > 0) {
      entries.push({ name: `${stem}-${track.trackNum}.pcm`, bytes: writeMsu1Pcm(channels, loopSample) });
    }
    onProgress?.({ trackNum: track.trackNum, done: index + 1, total: tracks.length });
  }

  // STORE throughout: PCM does not deflate usefully and a set of these is gigabytes.
  return zipEntries(entries, { store: true });
};

export { exportMsu1Pack, sanitizeStem };
export type { ExportMsu1Params, Msu1ExportProgress };
