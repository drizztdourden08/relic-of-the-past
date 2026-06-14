/* @layer renderer-hud @kind hook */
import { useGameUIStore } from '../../../../stores/game-ui-store';
import { getSpritesBase } from '@shared/game/items/sprites';

/**
 * SNES native resolution constants.
 * All HUD layout is in SNES pixel units, multiplied by scale.
 */
const SNES_WIDTH = 256;
const SNES_HEIGHT = 224;
const SNES_TILE = 8;
/** Original HUD top bar height in SNES pixels (4 tile rows) */
const HUD_BAR_HEIGHT = 32;

interface HudData {
  healthCurrent: number;
  healthCapacity: number;
  magicPower: number;
  halfMagic: boolean;
  rupees: number;
  bombs: number;
  arrows: number;
  keys: number;
  equippedY: number;
}

interface HudConfig {
  /** Integer pixel scale (1 SNES px = scale CSS px) */
  scale: number;
  /** Base URL for sprite images */
  spritesBase: string;
}

interface UseHudResult {
  data: HudData;
  config: HudConfig;
  spriteUrl: (filename: string) => string;
}

const useHud = (scale: number): UseHudResult => {
  const hud = useGameUIStore((s) => s.hud);
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
  };

  const config: HudConfig = { scale, spritesBase };
  const spriteUrl = (filename: string) => `${spritesBase}${filename}.png`;

  return { data, config, spriteUrl };
};

export { useHud, SNES_WIDTH, SNES_HEIGHT, SNES_TILE, HUD_BAR_HEIGHT };
export type { HudData, HudConfig, UseHudResult };
