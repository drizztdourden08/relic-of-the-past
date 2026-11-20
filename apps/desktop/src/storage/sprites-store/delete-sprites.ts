/* @layer renderer-lib @kind logic */
import { sprites } from '@rotp/packs';
import { assets } from '@rotp/roms';
import { romRelease } from '../asset-files';
import { platformFiles } from '../platform-files';
import { refreshJapaneseGraphics } from './refresh-japanese-graphics';
import { JAPANESE_ROM_LANGUAGE } from './sprites-store.constants';

const isJapaneseRom = async (romFile: string): Promise<boolean> => {
  const bytes = await platformFiles().readBytes(`roms/${romFile}`).catch(() => null);
  return bytes !== null && (await romRelease(bytes))?.language === JAPANESE_ROM_LANGUAGE;
};

const deleteSprites = async (romFile: string) => {
  const removal = await sprites.remove(platformFiles(), romFile);
  if (await isJapaneseRom(romFile)) await assets.removeJapaneseGraphics(platformFiles());
  await refreshJapaneseGraphics();
  return removal;
};

export { deleteSprites };
