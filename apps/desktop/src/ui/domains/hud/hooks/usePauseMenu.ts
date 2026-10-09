/* @layer renderer-hud @kind hook */
import { useGameUIStore } from '../../../../stores/game-ui-store';
import { getSpritesBase } from '@rotp/game-data';
import type { PauseMenuConfig, PauseMenuData, UsePauseMenuResult } from './hooks.type';

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
