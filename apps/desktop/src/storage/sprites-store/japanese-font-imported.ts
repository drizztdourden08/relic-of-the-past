/* @layer renderer-lib @kind logic */
import { decodeJapaneseGraphicsPack, hasJapaneseFont } from '@rotp/asset-extraction';
import { assets } from '@rotp/roms';
import { platformFiles } from '../platform-files';

const japaneseFontImported = async (): Promise<boolean> => {
  const pack = await assets.readJapaneseGraphics(platformFiles()).catch(() => null);
  return pack ? hasJapaneseFont(decodeJapaneseGraphicsPack(pack)) : false;
};

export { japaneseFontImported };
