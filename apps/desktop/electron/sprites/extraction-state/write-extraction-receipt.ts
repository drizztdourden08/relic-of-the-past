/* @layer electron-main @kind logic */
import { writeJsonFile } from '@drizztdourden08/brock-electron/main';
import { spriteManifestDigest } from '@shared/storage/sprite-manifest-digest';
import type { ExtractionReceipt } from './extraction-state.type';
import { pngsIn } from './pngs-in';
import { receiptPath } from './receipt-path';

const writeExtractionReceipt = async (outDir: string): Promise<void> => {
  const receipt: ExtractionReceipt = { manifest: spriteManifestDigest(), count: (await pngsIn(outDir)).size };
  await writeJsonFile(receiptPath(outDir), receipt);
};

export { writeExtractionReceipt };
