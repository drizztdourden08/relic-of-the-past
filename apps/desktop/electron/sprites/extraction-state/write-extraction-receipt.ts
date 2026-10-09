/* @layer electron-main @kind logic */
import { writeJson } from '../../lib/json-store';
import { spriteManifestDigest } from '@shared/storage/sprite-manifest-digest';
import type { ExtractionReceipt } from './extraction-state.type';
import { pngsIn } from './pngs-in';
import { receiptPath } from './receipt-path';

const writeExtractionReceipt = async (outDir: string): Promise<void> => {
  const receipt: ExtractionReceipt = { manifest: spriteManifestDigest(), count: (await pngsIn(outDir)).size };
  await writeJson(receiptPath(outDir), receipt);
};

export { writeExtractionReceipt };
