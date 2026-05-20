/**
 * usePauseMenu — provides pause menu state from the game UI store.
 * Mirrors useHud pattern: extracts relevant data, provides sprite config.
 */
import { useGameUIStore } from '../../stores/game-ui-store';
import { getSpritesBase } from '@shared/game/items/sprites';

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
  /** Whether to show crystals vs pendants */
  showCrystals: boolean;
  /** Progress indicator (0-2 = LW dungeons, 3+ = DW) */
  progressIndicator: number;
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

function usePauseMenu(scale: number): UsePauseMenuResult {
  const inventory = useGameUIStore((s) => s.inventory);
  const equipment = useGameUIStore((s) => s.equipment);
  const dungeon = useGameUIStore((s) => s.dungeonProgress);
  const hud = useGameUIStore((s) => s.hud);
  const saveMenu = useGameUIStore((s) => s.saveMenu);

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
    showCrystals: saveMenu.progressIndicator >= 3,
    progressIndicator: saveMenu.progressIndicator,
  };

  const config: PauseMenuConfig = { scale, spritesBase };
  const spriteUrl = (filename: string) => `${spritesBase}${filename}.png`;

  return { data, config, spriteUrl };
}

export { usePauseMenu };
export type { PauseMenuData, PauseMenuConfig, UsePauseMenuResult };
