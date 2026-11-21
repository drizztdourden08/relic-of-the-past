/* @layer renderer-appshell @kind logic */
import { setJapaneseGraphics } from '@rotp/game-core';
import { decodeJapaneseGraphicsPack, hasJapaneseFont } from '@rotp/asset-extraction';
import { assets } from '@rotp/roms';
import { log } from '@app/log-bus';
import { platformFiles } from '@app/storage/platform-files';
import { japanesePiecesOf, useJapaneseGraphicsStore } from '@app/stores/japanese-graphics-store';

const loadJapaneseGraphics = async (): Promise<void> => {
  const { setStatus } = useJapaneseGraphicsStore.getState();
  try {
    const pack = await assets.readJapaneseGraphics(platformFiles());
    const entries = pack ? decodeJapaneseGraphicsPack(pack) : [];
    setJapaneseGraphics(entries);
    log.app(`[JapaneseGraphics] ${entries.length > 0 ? `${entries.length} pictures loaded` : 'no Japanese sprites imported'}`);
    setStatus({ available: entries.length > 0, fontImported: hasJapaneseFont(entries), ...japanesePiecesOf(entries) });
  } catch (err) {
    log.error(`[JapaneseGraphics] Failed to read the pack: ${err instanceof Error ? err.message : err}`);
    setJapaneseGraphics([]);
    setStatus({ available: false, fontImported: false, menus: false, pause: false, ending: false });
  }
};

export { loadJapaneseGraphics };
