/* @layer renderer-widgets @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { GameUIState } from '@rotp/game-data';
import { BOTTLE_NAMES, ITEM_NAMES } from '../DebugWidget.constants';
import type { StateSectionData } from '../DebugWidget.type';
import { bin } from './bin';
import { formatHearts } from './format-hearts';
import { hex } from './hex';
import { yn } from './yes-no';

const bottleName = (text: I18n['text'], value: number): string => {
  if (value <= 0) return '-';
  const name = BOTTLE_NAMES[value];
  return name ? text(name) : `?${value}`;
};

const playerSections = (t: I18n['t'], text: I18n['text'], state: GameUIState): StateSectionData[] => {
  const { hud, inventory, equipment, dungeonProgress } = state;
  return [
    { title: t('views-debug:section.hud'), rows: [
      { label: t('views-debug:row.hearts'), value: formatHearts(hud.healthCurrent, hud.healthCapacity), mono: true },
      { label: t('views-debug:row.magic'), value: `${hud.magicPower}/128${hud.halfMagic ? ' (½)' : ''}` },
      { label: t('views-debug:row.rupees'), value: hud.rupees !== hud.rupeeTarget ? `${hud.rupees} -> ${hud.rupeeTarget}` : String(hud.rupees) },
      { label: t('views-debug:row.bombs.arrows'), value: `${hud.bombs} / ${hud.arrows}` },
      { label: t('views-debug:row.keys'), value: hud.keys === 255 ? '-' : String(hud.keys) },
      { label: t('views-debug:row.equipped'), value: `${hud.equippedY} ${hud.equippedX} ${hud.equippedL} ${hud.equippedR}`, mono: true },
    ] },
    { title: t('views-debug:section.equipment'), rows: [
      { label: t('views-debug:row.sword'), value: String(equipment.sword) },
      { label: t('views-debug:row.shield'), value: String(equipment.shield) },
      { label: t('views-debug:row.armor'), value: String(equipment.armor) },
      { label: t('views-debug:row.gloves'), value: String(equipment.gloves) },
      { label: t('views-debug:row.boots.flippers.pearl'), value: `${yn(t, equipment.boots)} ${yn(t, equipment.flippers)} ${yn(t, equipment.moonPearl)}`, mono: true },
      { label: t('views-debug:row.heart.pieces'), value: `${equipment.heartPieces}/4` },
      { label: t('views-debug:row.ability.flags'), value: hex(equipment.abilityFlags), mono: true },
    ] },
    { title: t('views-debug:section.inventory'), rows: [
      ...inventory.items
        .map((v, i) => ({ label: ITEM_NAMES[i] ? text(ITEM_NAMES[i]) : t('views-debug:inventory.item', { index: i }), value: String(v) }))
        .filter((_, i) => (inventory.items[i] ?? 0) > 0),
      { label: t('views-debug:row.bottles'), value: inventory.bottles.map((v) => bottleName(text, v)).join(', ') },
    ] },
    { title: t('views-debug:section.dungeon.progress'), rows: [
      { label: t('views-debug:row.pendants'), value: bin(dungeonProgress.pendants, 3), mono: true },
      { label: t('views-debug:row.crystals'), value: bin(dungeonProgress.crystals, 7), mono: true },
      { label: t('views-debug:row.maps'), value: bin(dungeonProgress.maps, 13), mono: true },
      { label: t('views-debug:row.compasses'), value: bin(dungeonProgress.compasses, 13), mono: true },
      { label: t('views-debug:row.big.keys'), value: bin(dungeonProgress.bigKeys, 13), mono: true },
    ] },
  ];
};

export { playerSections };
