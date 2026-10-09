/* @layer renderer-lib @kind logic */
import { msu } from '@rotp/msu';
import { platformFiles } from '../platform-files';

const readMsuTrackFile = async (pack: string, fileName: string): Promise<ArrayBuffer> => {
  const bytes = await msu.readTrackFile(platformFiles(), pack, fileName);
  if (!bytes) throw new Error(`Track not found: ${fileName}`);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
};

export { readMsuTrackFile };
