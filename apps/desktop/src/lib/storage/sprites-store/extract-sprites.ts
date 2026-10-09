/* @layer renderer-lib @kind logic */
import * as sprites from '@shared/storage/sprites';
import type { SpriteBuffer } from '@rotp/asset-extraction';
import { runOnWorker } from '../extraction-client';
import { publishImportProgress } from '../import-progress-bus';
import { platformFiles } from '../platform-files';
import { errorMessage } from '../error-message';
import { SPRITE_DEFS } from './sprites-store.constants';

const extractSprites = async (romFile: string): Promise<{ success: boolean; count?: number; error?: string }> => {
  try {
    const romBytes = await platformFiles().readBytes(`roms/${romFile}`);
    if (!romBytes) return { success: false, error: `ROM file not found: ${romFile}` };
    publishImportProgress({ kind: 'sprite', id: romFile, phase: 'decode', message: 'Extracting sprites...' });
    const result = await runOnWorker<{ buffers: SpriteBuffer[]; errors: string[] }>({ op: 'sprites', romBytes, defs: SPRITE_DEFS });
    await sprites.writeSprites(platformFiles(), romFile, result.buffers);
    publishImportProgress({ kind: 'sprite', id: romFile, phase: 'done' });
    return { success: true, count: result.buffers.length };
  } catch (err) {
    const msg = errorMessage(err);
    publishImportProgress({ kind: 'sprite', id: romFile, phase: 'error', message: msg });
    return { success: false, error: msg };
  }
};

export { extractSprites };
