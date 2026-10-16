/* @layer renderer-lib @kind logic */
import { markAssetsBaked } from '@app/stores/game-assets-store';
import { readBakeInputs, storeAssetSet } from '../asset-files';
import type { AssetsResult, ExtractResult } from '../asset-files';
import { runExtractStep } from '../extraction-client';
import { platformFiles } from '../platform-files';
import { errorMessage } from '../error-message';

const extractAssets = async (romFile: string): Promise<ExtractResult> => {
  try {
    const inputs = await readBakeInputs(platformFiles(), romFile);
    if (!inputs) return { success: false, error: `ROM file not found: ${romFile}` };
    const { romBytes, supplementRoms, languages } = inputs;
    const result = await runExtractStep<'assets', AssetsResult>({
      step: 'assets', title: 'Building the game assets', subject: romFile, romBytes, input: { supplementRoms, languages },
    });
    const stored = await storeAssetSet(platformFiles(), romFile, inputs.supplementRoms, result);
    markAssetsBaked();
    return stored;
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
};

export { extractAssets };
