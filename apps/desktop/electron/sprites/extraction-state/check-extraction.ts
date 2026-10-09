/* @layer electron-main @kind logic */
import { readJson } from '../../lib/json-store';
import { expectedSpriteFiles, spriteManifestDigest } from '@shared/storage/sprite-manifest-digest';
import type { ExtractionReceipt, ExtractionStatus } from './extraction-state.type';
import { pngsIn } from './pngs-in';
import { receiptPath } from './receipt-path';

const checkExtraction = async (outDir: string): Promise<ExtractionStatus> => {
  const present = await pngsIn(outDir);
  if (present.size === 0) return { extracted: false, count: 0 };

  const receipt = await readJson<ExtractionReceipt | null>(receiptPath(outDir), null);
  if (receipt && receipt.manifest === spriteManifestDigest()) return { extracted: true, count: present.size };

  return { extracted: expectedSpriteFiles().every(file => present.has(file)), count: present.size };
};

export { checkExtraction };
