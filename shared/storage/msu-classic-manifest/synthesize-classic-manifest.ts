/* @layer shared-storage @kind logic */
import type { MsuPackManifest } from '@rotp/game-data';
import { classicTrackDef } from './classic-track-def';
import { dedupeByTrackNum } from './dedupe-by-track-num';
import type { ClassicTrack } from './msu-classic-manifest.type';

const synthesizeClassicManifest = (packName: string, tracks: ClassicTrack[]): MsuPackManifest => {
  const now = Date.now();
  return {
    version: 1,
    meta: { name: packName, createdAt: now, modifiedAt: now },
    tracks: dedupeByTrackNum(tracks).map(classicTrackDef),
  };
};

export { synthesizeClassicManifest };
