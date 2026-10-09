/* @layer renderer-appshell @kind logic */
import type { GameSettings } from '@rotp/features';
import { setLinkSpriteData } from '@app/lib/game';
import { log } from '@app/lib/log-bus';
import { readSpriteAsZspr } from '@app/lib/game/player-sheet/load-sheet';

const loadPlayerSprite = async (settings: GameSettings) => {
  if (!settings.linkSprite) { setLinkSpriteData(null); return; }
  try {
    const bytes = await readSpriteAsZspr(settings.linkSprite);
    setLinkSpriteData(bytes ?? null);
    if (!bytes) log.app(`[PlayerSprite] Selected sprite "${settings.linkSprite}" not found`);
  } catch (err) {
    log.error(`[PlayerSprite] Failed to load sprite: ${err instanceof Error ? err.message : err}`);
    setLinkSpriteData(null);
  }
};

export { loadPlayerSprite };
