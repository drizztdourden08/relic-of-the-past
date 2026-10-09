/* @layer renderer-components @kind logic */
import { applyPlayerSprite, clearPlayerSprite, setLinkSpriteData } from '@app/game';
import { readSpriteAsZspr } from '@app/game/player-sheet/load-sheet';

const swapPlayerSprite = async (name: string | null): Promise<void> => {
  if (!name) {
    setLinkSpriteData(null);
    clearPlayerSprite();
    return;
  }
  const bytes = await readSpriteAsZspr(name);
  setLinkSpriteData(bytes ?? null);
  if (bytes) applyPlayerSprite(bytes);
};

export { swapPlayerSprite };
