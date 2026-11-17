/* @layer renderer-appshell @kind logic */
import { setJapaneseGraphics } from '@rotp/game-core';
import { decodeJapaneseGraphicsPack } from '@rotp/asset-extraction';
import { assets } from '@rotp/roms';
import { log } from '@app/log-bus';
import { platformFiles } from '@app/storage/platform-files';
import { useJapaneseGraphicsStore } from '@app/stores/japanese-graphics-store';

const loadJapaneseGraphics = async (): Promise<void> => {
  const { setAvailable } = useJapaneseGraphicsStore.getState();
  try {
    const pack = await assets.readJapaneseGraphics(platformFiles());
    const entries = pack ? decodeJapaneseGraphicsPack(pack) : [];
    setJapaneseGraphics(entries);
    setAvailable(entries.length > 0);
  } catch (err) {
    log.error(`[JapaneseGraphics] Failed to read the pack: ${err instanceof Error ? err.message : err}`);
    setJapaneseGraphics([]);
    setAvailable(false);
  }
};

export { loadJapaneseGraphics };
