/* @layer renderer-lib @kind logic */
import { assets } from '@rotp/roms';
import { runExtractStep } from '../extraction-client';
import { platformFiles } from '../platform-files';
import { useJapaneseGraphicsStore } from '@app/stores/japanese-graphics-store';

const extractJapaneseGraphics = async (romFile: string, romBytes: Uint8Array): Promise<void> => {
  const pack = await runExtractStep<'japanese-graphics', Uint8Array | null>({
    step: 'japanese-graphics', title: 'Reading the Japanese graphics', subject: romFile, romBytes, input: undefined,
  });
  if (!pack) return;
  await assets.writeJapaneseGraphics(platformFiles(), pack);
  useJapaneseGraphicsStore.getState().setAvailable(true);
};

export { extractJapaneseGraphics };
