/* @layer renderer-widgets @kind logic */
import type { GameUIState } from '@rotp/game-data';
import { BOTTLE_NAMES, ITEM_NAMES } from '../DebugWidget.constants';
import type { StateSectionData } from '../DebugWidget.type';
import { bin } from './bin';
import { formatHearts } from './format-hearts';
import { hex } from './hex';
import { yn } from './yes-no';

const playerSections = (state: GameUIState): StateSectionData[] => {
  const { hud, inventory, equipment, dungeonProgress } = state;
  return [
    { title: 'HUD', rows: [
      { label: 'Hearts', value: formatHearts(hud.healthCurrent, hud.healthCapacity), mono: true },
      { label: 'Magic', value: `${hud.magicPower}/128${hud.halfMagic ? ' (½)' : ''}` },
      { label: 'Rupees', value: hud.rupees !== hud.rupeeTarget ? `${hud.rupees} -> ${hud.rupeeTarget}` : String(hud.rupees) },
      { label: 'Bombs / Arrows', value: `${hud.bombs} / ${hud.arrows}` },
      { label: 'Keys', value: hud.keys === 255 ? '-' : String(hud.keys) },
      { label: 'Equipped (Y X L R)', value: `${hud.equippedY} ${hud.equippedX} ${hud.equippedL} ${hud.equippedR}`, mono: true },
    ] },
    { title: 'Equipment', rows: [
      { label: 'Sword', value: String(equipment.sword) },
      { label: 'Shield', value: String(equipment.shield) },
      { label: 'Armor', value: String(equipment.armor) },
      { label: 'Gloves', value: String(equipment.gloves) },
      { label: 'Boots / Flippers / Pearl', value: `${yn(equipment.boots)} ${yn(equipment.flippers)} ${yn(equipment.moonPearl)}`, mono: true },
      { label: 'Heart Pieces', value: `${equipment.heartPieces}/4` },
      { label: 'Ability Flags', value: hex(equipment.abilityFlags), mono: true },
    ] },
    { title: 'Inventory', rows: [
      ...inventory.items
        .map((v, i) => ({ label: ITEM_NAMES[i] ?? `Item ${i}`, value: String(v) }))
        .filter((_, i) => (inventory.items[i] ?? 0) > 0),
      { label: 'Bottles', value: inventory.bottles.map((v) => (v > 0 ? (BOTTLE_NAMES[v] ?? `?${v}`) : '-')).join(', ') },
    ] },
    { title: 'Dungeon Progress', rows: [
      { label: 'Pendants', value: bin(dungeonProgress.pendants, 3), mono: true },
      { label: 'Crystals', value: bin(dungeonProgress.crystals, 7), mono: true },
      { label: 'Maps', value: bin(dungeonProgress.maps, 13), mono: true },
      { label: 'Compasses', value: bin(dungeonProgress.compasses, 13), mono: true },
      { label: 'Big Keys', value: bin(dungeonProgress.bigKeys, 13), mono: true },
    ] },
  ];
};

export { playerSections };
