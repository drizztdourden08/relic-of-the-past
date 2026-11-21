/* @layer renderer-lib @kind logic */
import { hasJapaneseFont } from '@rotp/asset-extraction';
import { japanesePiecesOf, useJapaneseGraphicsStore } from '@app/stores/japanese-graphics-store';
import { readJapaneseGraphicEntries } from './read-japanese-graphic-entries';

const refreshJapaneseGraphics = async (): Promise<void> => {
  const entries = await readJapaneseGraphicEntries();
  useJapaneseGraphicsStore.getState().setStatus({ available: entries.length > 0, fontImported: hasJapaneseFont(entries), ...japanesePiecesOf(entries) });
};

export { refreshJapaneseGraphics };
