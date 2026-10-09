/* @layer shared-storage @kind logic */
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import { classicTrackDef } from './classic-track-def';
import { dedupeByTrackNum } from './dedupe-by-track-num';
import type { ClassicTrack } from './msu-classic-manifest.type';

const mergeClassicTracks = (manifest: MsuPackManifest, tracks: ClassicTrack[]): MsuPackManifest => {
  const authored = new Set(manifest.tracks.map((t) => t.trackNum));
  const filled = dedupeByTrackNum(tracks).filter((t) => !authored.has(t.trackNum)).map(classicTrackDef);
  if (filled.length === 0) return manifest;
  return { ...manifest, tracks: [...manifest.tracks, ...filled].sort((a, b) => a.trackNum - b.trackNum) };
};

export { mergeClassicTracks };
