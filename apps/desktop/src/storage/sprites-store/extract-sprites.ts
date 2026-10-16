/* @layer renderer-lib @kind logic */
import { sprites } from '@rotp/packs';
import type { SpriteBuffer } from '@rotp/asset-extraction';
import { runExtractStep } from '../extraction-client';
import { runImportJob } from '../import-job';
import { platformFiles } from '../platform-files';
import { errorMessage } from '../error-message';
import { SPRITE_DEFS } from './sprites-store.constants';

const extractSprites = async (romFile: string): Promise<{ success: boolean; count?: number; error?: string }> => {
  try {
    const romBytes = await platformFiles().readBytes(`roms/${romFile}`);
    if (!romBytes) return { success: false, error: `ROM file not found: ${romFile}` };
    const buffers = await runImportJob({
      kind: 'sprite',
      title: 'Extracting sprites',
      work: async (report) => {
        report.phase('decode', 'Extracting sprites...');
        const result = await runExtractStep<'sprites', { buffers: SpriteBuffer[]; errors: string[] }>({
          step: 'sprites', title: 'Extracting sprites', subject: romFile, romBytes, input: { defs: SPRITE_DEFS },
        });
        await sprites.writeSprites(platformFiles(), romFile, result.buffers);
        return result.buffers;
      },
    });
    return { success: true, count: buffers.length };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
};

export { extractSprites };
