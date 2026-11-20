/* @layer renderer-components @kind logic */
import type { MsuPackManifest } from '@rotp/game-data';
import { withTrackFiles } from './with-track-files';

const withTrackFile = (
  manifest: MsuPackManifest, trackNum: number, fileName: string | null, name: string,
): MsuPackManifest => withTrackFiles(manifest, trackNum, fileName ? [fileName] : [], name);

export { withTrackFile };
