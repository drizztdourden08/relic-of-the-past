/* @layer renderer-lib @kind logic */
import { alttpMsuConfig, msu } from '@rotp/msu';
import { platformFiles } from '../platform-files';

const writeMsuTrackFile = (pack: string, fileName: string, data: ArrayBuffer) =>
  msu.writeTrackFile(alttpMsuConfig, platformFiles(), pack, { name: fileName, bytes: new Uint8Array(data) });

export { writeMsuTrackFile };
