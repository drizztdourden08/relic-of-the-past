/* @layer shared-game @kind logic */
import type { CheckRecord } from '@rotp/game-data';
import { find } from '@rotp/game-data';
import { DARK_WORLD_SCREEN_BASE } from '../../overworld.constants';

const npcConfigForSprite = (spriteType: number, roomId?: number, outdoor?: boolean): CheckRecord | undefined =>
  find('check', c => c.gameId.spriteType !== undefined).find((c) => {
    const cfg = c.gameId;
    if (cfg.spriteType !== spriteType) return false;
    if (cfg.room !== undefined && cfg.room !== roomId) return false;
    if (cfg.owWorld !== undefined && outdoor) {
      if (roomId == null) return false;
      const isDark = roomId >= DARK_WORLD_SCREEN_BASE;
      if (isDark !== (cfg.owWorld === 'dark')) return false;
    }
    return true;
  });

export { npcConfigForSprite };
