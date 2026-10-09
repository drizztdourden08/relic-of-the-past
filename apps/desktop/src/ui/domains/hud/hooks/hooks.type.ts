/* @layer renderer-hud @kind types */
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
  items: number[];
  maxRupees: number;
  maxBombs: number;
  maxArrows: number;
}

interface HudConfig {
  scale: number;
  spritesBase: string;
}

interface UseHudResult {
  data: HudData;
  config: HudConfig;
  spriteUrl: (filename: string) => string;
}

interface PauseMenuData {
  items: number[];
  equippedY: number;
  equippedX: number;
  pendants: number;
  crystals: number;
  sword: number;
  shield: number;
  armor: number;
  gloves: number;
  boots: number;
  flippers: number;
  moonPearl: number;
  abilityFlags: number;
  showCrystals: boolean;
  progressIndicator: number;
  heartPieces: number;
  isInDungeon: boolean;
  bigKeys: number;
  maps: number;
  compasses: number;
  palaceIndex: number;
  bottles: number[];
}

interface PauseMenuConfig {
  scale: number;
  spritesBase: string;
}

interface UsePauseMenuResult {
  data: PauseMenuData;
  config: PauseMenuConfig;
  spriteUrl: (filename: string) => string;
}

export type { HudConfig, HudData, PauseMenuConfig, PauseMenuData, UseHudResult, UsePauseMenuResult };
