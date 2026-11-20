/* @layer renderer-lib @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Text } from '@drizztdourden08/brock-core/i18n';
import { sprites } from '@rotp/packs';
import { runExtractStep } from '../extraction-client';
import { runImportJob } from '../import-job';
import { platformFiles } from '../platform-files';
import { errorText } from '../localized-error';
import { extractJapaneseGraphics } from './extract-japanese-graphics';
import { SPRITE_DEFS } from './sprites-store.constants';
import type { SpritesResult } from './sprites-store.type';
import { usSpriteFallback } from './us-sprite-fallback';

const extractSprites = async (romFile: string): Promise<{ success: boolean; count?: number; error?: Text }> => {
  try {
    const romBytes = await platformFiles().readBytes(`roms/${romFile}`);
    if (!romBytes) return { success: false, error: msg('errors:rom.notFound', { file: romFile }) };
    const buffers = await runImportJob({
      kind: 'sprite',
      title: msg('data-manager:jobs.extract-sprites', { rom: romFile }),
      work: async (report) => {
        report.phase('decode', 'Extracting sprites...');
        const result = await runExtractStep<'sprites', SpritesResult>({
          step: 'sprites', title: msg('data-manager:jobs.extract-sprites', { rom: romFile }), subject: romFile, romBytes, input: { defs: SPRITE_DEFS },
        });
        const extracted = await usSpriteFallback(romFile, romBytes, result);
        await sprites.writeSprites(platformFiles(), romFile, extracted);
        await extractJapaneseGraphics(romFile, romBytes);
        return extracted;
      },
    });
    return { success: true, count: buffers.length };
  } catch (err) {
    return { success: false, error: errorText(err) };
  }
};

export { extractSprites };
