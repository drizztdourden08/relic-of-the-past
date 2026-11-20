/* @layer renderer-lib @kind logic */
import { decodeJapaneseGraphicsPack, hasJapaneseFont } from '@rotp/asset-extraction';
import { assets } from '@rotp/roms';
import { platformFiles } from '../platform-files';

// True when the Japanese graphics pack (imported in Data > Sprites) holds the Japanese fonts.
const japaneseFontImported = async (): Promise<boolean> => {
  const pack = await assets.readJapaneseGraphics(platformFiles()).catch(() => null);
  return pack ? hasJapaneseFont(decodeJapaneseGraphicsPack(pack)) : false;
};

export { japaneseFontImported };
