/* @layer renderer-lib @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { markAssetsBaked } from '@app/stores/game-assets-store';
import { readBakeInputs, storeAssetSet } from '../asset-files';
import type { AssetsResult, ExtractResult } from '../asset-files';
import { runExtractStep } from '../extraction-client';
import { platformFiles } from '../platform-files';
import { errorText } from '../localized-error';

const extractAssets = async (romFile: string): Promise<ExtractResult> => {
  try {
    const inputs = await readBakeInputs(platformFiles(), romFile);
    if (!inputs) return { success: false, error: msg('errors:rom.notFound', { file: romFile }) };
    const { romBytes, supplementRoms, languages } = inputs;
    const result = await runExtractStep<'assets', AssetsResult>({
      step: 'assets', title: 'Building the game assets', subject: romFile, romBytes, input: { supplementRoms, languages },
    });
    const stored = await storeAssetSet(platformFiles(), romFile, inputs.supplementRoms, result);
    markAssetsBaked();
    return stored;
  } catch (err) {
    return { success: false, error: errorText(err) };
  }
};

export { extractAssets };
