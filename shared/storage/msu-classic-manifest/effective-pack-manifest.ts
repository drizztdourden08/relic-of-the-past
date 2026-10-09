/* @layer shared-storage @kind logic */
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import { mergeClassicTracks } from './merge-classic-tracks';
import type { ClassicTrack } from './msu-classic-manifest.type';
import { synthesizeClassicManifest } from './synthesize-classic-manifest';

const effectivePackManifest = (
  packName: string, manifest: MsuPackManifest | null, tracks: ClassicTrack[],
): MsuPackManifest =>
  manifest ? mergeClassicTracks(manifest, tracks) : synthesizeClassicManifest(packName, tracks);

export { effectivePackManifest };
