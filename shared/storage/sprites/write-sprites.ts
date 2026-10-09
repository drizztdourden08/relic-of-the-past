/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { writeJson } from '../json';
import { spriteManifestDigest } from '../sprite-manifest-digest';
import { spriteDir } from './sprite-dir';
import { RECEIPT_FILE } from './sprites.constants';
import type { ExtractionReceipt, SpriteBuffer } from './sprites.type';

const writeSprites = async (files: FileStore, romFile: string, buffers: SpriteBuffer[]): Promise<void> => {
  await files.remove(spriteDir(romFile));
  for (const buf of buffers) await files.writeBytes(`${spriteDir(romFile)}/${buf.name}`, buf.bytes);
  const receipt: ExtractionReceipt = { manifest: spriteManifestDigest(), count: buffers.length };
  await writeJson(files, `${spriteDir(romFile)}/${RECEIPT_FILE}`, receipt);
};

export { writeSprites };
