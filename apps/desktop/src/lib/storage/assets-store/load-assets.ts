/* @layer renderer-lib @kind logic */
import { assets } from '@rotp/roms';
import { platformFiles } from '../platform-files';

const loadAssets = async (romFile: string): Promise<ArrayBuffer | null> => {
  const bytes = await assets.load(platformFiles(), romFile);
  return bytes ? (bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer) : null;
};

export { loadAssets };
