/* @layer renderer-lib @kind logic */
import { msu } from '@rotp/msu';
import { platformFiles } from '../platform-files';

const writeMsuTrackFile = (pack: string, fileName: string, data: ArrayBuffer) =>
  msu.writeTrackFile(platformFiles(), pack, fileName, new Uint8Array(data));

export { writeMsuTrackFile };
