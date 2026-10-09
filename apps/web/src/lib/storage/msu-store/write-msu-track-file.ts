/* @layer renderer-lib @kind logic */
import * as msu from '@shared/storage/msu';
import { platformFiles } from '../platform-files';

const writeMsuTrackFile = (pack: string, fileName: string, data: ArrayBuffer) =>
  msu.writeTrackFile(platformFiles(), pack, fileName, new Uint8Array(data));

export { writeMsuTrackFile };
