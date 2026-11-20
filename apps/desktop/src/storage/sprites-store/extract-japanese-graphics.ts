/* @layer renderer-lib @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { assets } from '@rotp/roms';
import { runExtractStep } from '../extraction-client';
import { platformFiles } from '../platform-files';
import { refreshJapaneseGraphics } from './refresh-japanese-graphics';

const extractJapaneseGraphics = async (romFile: string, romBytes: Uint8Array): Promise<void> => {
  const pack = await runExtractStep<'japanese-graphics', Uint8Array | null>({
    step: 'japanese-graphics', title: msg('data-manager:jobs.read-japanese-graphics', { rom: romFile }), subject: romFile, romBytes, input: undefined,
  });
  if (!pack) return;
  await assets.writeJapaneseGraphics(platformFiles(), pack);
  await refreshJapaneseGraphics();
};

export { extractJapaneseGraphics };
