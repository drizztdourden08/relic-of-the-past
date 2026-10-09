/* @layer renderer-hud @kind hook */
import { useGameUIStore } from '../stores/game-ui-store';
import { getSpritesBase } from '@rotp/game-data';
import type { HudConfig, HudData, UseHudResult } from './hooks.type';

const useHud = (scale: number): UseHudResult => {
  const hud = useGameUIStore((s) => s.hud);
  const items = useGameUIStore((s) => s.inventory.items);
  const spritesBase = getSpritesBase();

  const data: HudData = {
    healthCurrent: hud.healthCurrent,
    healthCapacity: hud.healthCapacity,
    magicPower: hud.magicPower,
    halfMagic: hud.halfMagic,
    rupees: hud.rupees,
    bombs: hud.bombs,
    arrows: hud.arrows,
    keys: hud.keys,
    equippedY: hud.equippedY,
    items,
    maxRupees: hud.maxRupees,
    maxBombs: hud.maxBombs,
    maxArrows: hud.maxArrows,
  };

  const config: HudConfig = { scale, spritesBase };
  const spriteUrl = (filename: string) => `${spritesBase}${filename}.png`;

  return { data, config, spriteUrl };
};

export { useHud };
