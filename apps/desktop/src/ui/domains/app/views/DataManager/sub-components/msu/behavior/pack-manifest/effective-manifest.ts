/* @layer renderer-components @kind logic */
import type { MsuPackManifest } from '@rotp/game-data';
import { effectivePackManifest } from '@shared/storage/msu-classic-manifest';
import type { TrackInfo } from '../../msu.type';

const effectiveManifest = (
  pack: string, manifest: MsuPackManifest | null, trackInfos: TrackInfo[],
): MsuPackManifest =>
  effectivePackManifest(pack, manifest, trackInfos.map((t) => ({ fileName: t.fileName, trackNum: t.trackNum })));

export { effectiveManifest };
