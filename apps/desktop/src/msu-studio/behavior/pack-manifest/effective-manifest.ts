/* @layer renderer-components @kind logic */
import type { MsuPackManifest } from '@rotp/game-data';
import { alttpMsuConfig, effectivePackManifest } from '@rotp/msu';
import type { TrackInfo } from '../../msu.type';

const effectiveManifest = (
  pack: string, manifest: MsuPackManifest | null, trackInfos: TrackInfo[],
): MsuPackManifest =>
  effectivePackManifest(alttpMsuConfig, pack, manifest, trackInfos.map((t) => ({ fileName: t.fileName, trackNum: t.trackNum })));

export { effectiveManifest };
