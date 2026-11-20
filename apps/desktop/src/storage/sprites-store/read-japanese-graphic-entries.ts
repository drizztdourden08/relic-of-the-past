/* @layer renderer-lib @kind logic */
import { decodeJapaneseGraphicsPack } from '@rotp/asset-extraction';
import type { JapaneseGraphicEntry } from '@rotp/asset-extraction';
import { assets } from '@rotp/roms';
import { platformFiles } from '../platform-files';

const readJapaneseGraphicEntries = async (): Promise<JapaneseGraphicEntry[]> => {
  const pack = await assets.readJapaneseGraphics(platformFiles()).catch(() => null);
  if (!pack) return [];
  try {
    return decodeJapaneseGraphicsPack(pack);
  } catch {
    return [];
  }
};

export { readJapaneseGraphicEntries };
