/* @layer renderer-widgets @kind logic */
import type { GameUIState } from '@shared/game/types';

interface StateRow {
  label: string;
  value: string;
  mono?: boolean;
}

interface StateSectionData {
  title: string;
  rows: StateRow[];
}

const ITEM_NAMES = [
  'Bow', 'Boomerang', 'Hookshot', 'Bombs', 'Mushroom/Powder',
  'Fire Rod', 'Ice Rod', 'Bombos', 'Ether', 'Quake',
  'Lamp', 'Hammer', 'Flute/Shovel', 'Bug Net', 'Book of Mudora',
  'Bottle Select', 'Cane of Somaria', 'Cane of Byrna', 'Cape', 'Mirror',
];
const BOTTLE_NAMES = ['Empty', 'Mushroom', 'Green Potion', 'Red Potion', 'Blue Potion', 'Fairy', 'Bee', 'Good Bee'];

const formatHearts = (current: number, capacity: number): string => {
  const full = Math.floor(current / 8);
  const partial = current % 8;
  return `${full}${partial > 0 ? `+${partial}/8` : ''} / ${Math.floor(capacity / 8)}`;
};

const bin = (value: number, bits: number): string => value.toString(2).padStart(bits, '0');
const yn = (v: boolean | number): string => (v ? '✓' : '—');

const buildStateSections = (state: GameUIState): StateSectionData[] => {
  const { mode, gameMode, hud, inventory, equipment, dungeonProgress, text, map, floorIndicator, saveMenu } = state;
  return [
    { title: 'Mode', rows: [
      { label: 'UI Mode', value: String(mode) },
      { label: 'Module', value: `${gameMode.mainModule} / ${gameMode.subModule} / ${gameMode.subSubModule}`, mono: true },
    ] },
    { title: 'HUD', rows: [
      { label: 'Hearts', value: formatHearts(hud.healthCurrent, hud.healthCapacity), mono: true },
      { label: 'Magic', value: `${hud.magicPower}/128${hud.halfMagic ? ' (½)' : ''}` },
      { label: 'Rupees', value: hud.rupees !== hud.rupeeTarget ? `${hud.rupees} → ${hud.rupeeTarget}` : String(hud.rupees) },
      { label: 'Bombs / Arrows', value: `${hud.bombs} / ${hud.arrows}` },
      { label: 'Keys', value: hud.keys === 255 ? '—' : String(hud.keys) },
      { label: 'Equipped (Y X L R)', value: `${hud.equippedY} ${hud.equippedX} ${hud.equippedL} ${hud.equippedR}`, mono: true },
    ] },
    { title: 'Equipment', rows: [
      { label: 'Sword', value: String(equipment.sword) },
      { label: 'Shield', value: String(equipment.shield) },
      { label: 'Armor', value: String(equipment.armor) },
      { label: 'Gloves', value: String(equipment.gloves) },
      { label: 'Boots / Flippers / Pearl', value: `${yn(equipment.boots)} ${yn(equipment.flippers)} ${yn(equipment.moonPearl)}`, mono: true },
    ] },
    { title: 'Inventory', rows: [
      ...inventory.items
        .map((v, i) => ({ label: ITEM_NAMES[i] ?? `Item ${i}`, value: String(v) }))
        .filter((_, i) => inventory.items[i] > 0),
      { label: 'Bottles', value: inventory.bottles.map((v) => (v > 0 ? (BOTTLE_NAMES[v] ?? `?${v}`) : '—')).join(', ') },
    ] },
    { title: 'Dungeon Progress', rows: [
      { label: 'Pendants', value: bin(dungeonProgress.pendants, 3), mono: true },
      { label: 'Crystals', value: bin(dungeonProgress.crystals, 7), mono: true },
      { label: 'Maps', value: bin(dungeonProgress.maps, 13), mono: true },
      { label: 'Compasses', value: bin(dungeonProgress.compasses, 13), mono: true },
      { label: 'Big Keys', value: bin(dungeonProgress.bigKeys, 13), mono: true },
    ] },
    { title: 'Text', rows: [
      { label: 'Active', value: yn(text.isActive) },
      { label: 'Message #', value: String(text.messageId) },
      { label: 'Phase', value: String(text.renderPhase) },
      { label: 'Incr / Choice / Wait', value: `${text.incrementalState} / ${text.choice} / ${text.waitTimer}`, mono: true },
    ] },
    { title: 'Map', rows: [
      { label: 'Overworld State', value: String(map.overworldMapState) },
      { label: 'Room', value: `0x${map.roomIndex.toString(16).padStart(3, '0')}`, mono: true },
      { label: 'Dungeon Idx / Floor', value: `${map.dungeonIdx} / ${map.dungeonFloor}` },
      { label: 'Palace / Cur Floor', value: `${map.palaceIndex >> 1} / ${map.currentFloor}` },
      { label: 'Init State', value: String(map.dungeonInitState) },
    ] },
    { title: 'Floor Indicator', rows: [
      { label: 'Visible', value: yn(floorIndicator.isVisible) },
      { label: 'Timer', value: String(floorIndicator.timer) },
      { label: 'Floor', value: String(floorIndicator.floor) },
    ] },
    { title: 'Save Menu', rows: [
      { label: 'Cursor', value: String(saveMenu.cursorPosition) },
      { label: 'From Module', value: String(saveMenu.sourceModule) },
      { label: 'Progress', value: String(saveMenu.progressIndicator) },
    ] },
  ];
};

export { buildStateSections };
export type { StateRow, StateSectionData };
