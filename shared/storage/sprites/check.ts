/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { readJson } from '../json';
import { expectedSpriteFiles, spriteManifestDigest } from '../sprite-manifest-digest';
import { pngsIn } from './pngs-in';
import { spriteDir } from './sprite-dir';
import { RECEIPT_FILE } from './sprites.constants';
import type { ExtractionReceipt, SpriteCheck } from './sprites.type';

const check = async (files: FileStore, romFile: string): Promise<SpriteCheck> => {
  const present = await pngsIn(files, romFile);
  if (present.size === 0) return { extracted: false, count: 0 };

  const receipt = await readJson<ExtractionReceipt | null>(files, `${spriteDir(romFile)}/${RECEIPT_FILE}`, null);
  if (receipt && receipt.manifest === spriteManifestDigest()) return { extracted: true, count: present.size };

  return { extracted: expectedSpriteFiles().every((name) => present.has(name)), count: present.size };
};

export { check };
