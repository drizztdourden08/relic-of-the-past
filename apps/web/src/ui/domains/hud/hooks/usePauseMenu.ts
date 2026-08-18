/* @layer renderer-hud @kind hook */
/**
 * usePauseMenu — provides pause menu state from the game UI store.
 * Mirrors useHud pattern: extracts relevant data, provides sprite config.
 */
import { useGameUIStore } from '../../../../stores/game-ui-store';
import { getSpritesBase } from '@shared/game/logic/queries/item-sprites';

interface PauseMenuData {
  /** 20 item slots (inventory.items) */
  items: number[];
  /** Currently equipped Y-item slot index */
  equippedY: number;
  /** Currently equipped X-item slot index */
  equippedX: number;
  /** Pendant bitmask (bits 0-2) */
  pendants: number;
  /** Crystal bitmask (bits 0-6) */
  crystals: number;
  /** Sword level (0=none, 1-4) */
  sword: number;
  /** Shield level (0=none, 1-3) */
  shield: number;
  /** Armor level (0=green, 1=blue, 2=red) */
  armor: number;
  /** Gloves level (0=none, 1=power, 2=titan) */
  gloves: number;
  /** Boots (0=none, 1=pegasus) */
  boots: number;
  /** Flippers (0=none, 1=yes) */
  flippers: number;
  /** Moon Pearl (0=none, 1=yes) */
  moonPearl: number;
  /** Ability flags bitmask from link_ability_flags */
  abilityFlags: number;
  /** Whether to show crystals vs pendants */
  showCrystals: boolean;
  /** Progress indicator — tier 3 is where the dark world opens (see progress-tier.ts). */
  progressIndicator: number;
  /** Heart pieces collected (0-3) */
  heartPieces: number;
  /** Whether the player is currently in a dungeon (palace) */
  isInDungeon: boolean;
  /** Dungeon big keys bitmask */
  bigKeys: number;
  /** Dungeon maps bitmask */
  maps: number;
  /** Dungeon compasses bitmask */
  compasses: number;
  /** Current palace index (×2) */
  palaceIndex: number;
  /** Bottle contents (4 slots, values 0-8) */
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

const usePauseMenu = (scale: number): UsePauseMenuResult => {
  const inventory = useGameUIStore((s) => s.inventory);
  const equipment = useGameUIStore((s) => s.equipment);
  const dungeon = useGameUIStore((s) => s.dungeonProgress);
  const hud = useGameUIStore((s) => s.hud);
  const saveMenu = useGameUIStore((s) => s.saveMenu);
  const map = useGameUIStore((s) => s.map);

  const spritesBase = getSpritesBase();

  const data: PauseMenuData = {
    items: inventory.items,
    equippedY: hud.equippedY,
    equippedX: hud.equippedX,
    pendants: dungeon.pendants,
    crystals: dungeon.crystals,
    sword: equipment.sword,
    shield: equipment.shield,
    armor: equipment.armor,
    gloves: equipment.gloves,
    boots: equipment.boots,
    flippers: equipment.flippers,
    moonPearl: equipment.moonPearl,
    abilityFlags: equipment.abilityFlags,
    showCrystals: saveMenu.progressIndicator >= 3,
    progressIndicator: saveMenu.progressIndicator,
    heartPieces: equipment.heartPieces,
    isInDungeon: map.palaceIndex !== 0xff,
    bigKeys: dungeon.bigKeys,
    maps: dungeon.maps,
    compasses: dungeon.compasses,
    palaceIndex: map.palaceIndex,
    bottles: inventory.bottles,
  };

  const config: PauseMenuConfig = { scale, spritesBase };
  const spriteUrl = (filename: string) => `${spritesBase}${filename}.png`;

  return { data, config, spriteUrl };
};

export { usePauseMenu };
export type { PauseMenuData, PauseMenuConfig, UsePauseMenuResult };
