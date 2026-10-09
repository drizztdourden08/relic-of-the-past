/* @layer renderer-widgets @kind logic */
import { getItemByGameId } from '@rotp/game-data';
import { BY_VALUE, LADDERS, MIRROR, SIMPLE } from '@rotp/navigation';
import { CheatSlot } from '@app/game';
import { getSlotSprite } from '@app/composites/PauseItemSlot';
import { EQUIP_SPRITES } from '@app/composites/PauseEquipSlot';
import { BOTTLE_SLOT_INDEX, BOW_RUNG_VALUES, BOW_TOP_VALUE, MIRROR_SLOT_INDEX, RAW_VALUE_LABELS } from '../../ItemsTab.constants';
import type { SlotPlace, SlotSpec, SpriteOf, TierOption } from '../../ItemsTab.type';

const gridSprite = (slot: number): SpriteOf => (value) => getSlotSprite(slot, value);
const equipSprite = (type: string): SpriteOf => (value) => EQUIP_SPRITES[type]?.[value] ?? null;

const labelOf = (slot: number, value: number, receiveItemId?: number): string => {
  const raw = RAW_VALUE_LABELS[slot]?.[value];
  if (raw) return raw;
  const record = receiveItemId === undefined ? undefined : getItemByGameId({ receiveItemId });
  return record?.name ?? `Value ${value}`;
};

const noneTier = (slot: number, sprite: SpriteOf): TierOption => ({
  value: 0, label: RAW_VALUE_LABELS[slot]?.[0] ?? 'None', sprite: sprite(0),
});

const tier = (slot: number, value: number, sprite: SpriteOf, receiveItemId?: number): TierOption =>
  ({ value, label: labelOf(slot, value, receiveItemId), sprite: sprite(value), receiveItemId });

const flagSpec = (slot: number, nameKey: string, place: SlotPlace, receiveItemId: number, sprite: SpriteOf): SlotSpec => ({
  slot, kind: 'flag', nameKey, place,
  tiers: [noneTier(slot, sprite), tier(slot, 1, sprite, receiveItemId)],
});

const ladderSpec = (
  slot: number, nameKey: string, place: SlotPlace, ladder: readonly number[], sprite: SpriteOf,
  rungValues?: readonly number[], topValue?: number,
): SlotSpec => {
  const tiers: TierOption[] = [noneTier(slot, sprite)];
  const last = topValue ?? ladder.length;
  for (let value = 1; value <= last; value++) {
    const rung = rungValues ? rungValues.indexOf(value) : value - 1;
    tiers.push(tier(slot, value, sprite, rung >= 0 ? ladder[rung] : undefined));
  }
  return { slot, kind: 'ladder', nameKey, place, tiers };
};

const byValueSpec = (slot: number, nameKey: string, table: Readonly<Record<number, number>>, sprite: SpriteOf): SlotSpec => ({
  slot, kind: 'byValue', nameKey, place: 'grid',
  tiers: [
    noneTier(slot, sprite),
    ...Object.entries(table).map(([value, receiveItemId]) => tier(slot, Number(value), sprite, receiveItemId)),
  ],
});

const gridFlag = (slot: number, nameKey: keyof typeof SIMPLE): SlotSpec =>
  flagSpec(slot, nameKey, 'grid', SIMPLE[nameKey], gridSprite(slot));

const abilityFlag = (slot: number, nameKey: keyof typeof SIMPLE, type: string): SlotSpec =>
  flagSpec(slot, nameKey, 'ability', SIMPLE[nameKey], equipSprite(type));

const mirrorSpec = (): SlotSpec => {
  const sprite = gridSprite(MIRROR_SLOT_INDEX);
  return {
    slot: MIRROR_SLOT_INDEX, kind: 'ladder', nameKey: 'mirror', place: 'grid',
    tiers: [noneTier(MIRROR_SLOT_INDEX, sprite), tier(MIRROR_SLOT_INDEX, 1, sprite), tier(MIRROR_SLOT_INDEX, 2, sprite, MIRROR)],
  };
};

const bottleSpec = (): SlotSpec => ({
  slot: BOTTLE_SLOT_INDEX, kind: 'bottle', nameKey: 'bottle', place: 'grid', tiers: [],
});

const buildSlotSpecs = (): SlotSpec[] => [
  ladderSpec(0, 'bow', 'grid', LADDERS.bow, gridSprite(0), BOW_RUNG_VALUES, BOW_TOP_VALUE),
  byValueSpec(1, 'boomerang', BY_VALUE.boomerang, gridSprite(1)),
  gridFlag(2, 'hookshot'),
  gridFlag(3, 'bombs'),
  byValueSpec(4, 'mushroom', BY_VALUE.mushroom, gridSprite(4)),
  gridFlag(5, 'fireRod'),
  gridFlag(6, 'iceRod'),
  gridFlag(7, 'bombos'),
  gridFlag(8, 'ether'),
  gridFlag(9, 'quake'),
  gridFlag(10, 'lamp'),
  gridFlag(11, 'hammer'),
  byValueSpec(12, 'flute', BY_VALUE.flute, gridSprite(12)),
  gridFlag(13, 'bugNet'),
  gridFlag(14, 'book'),
  bottleSpec(),
  gridFlag(16, 'somaria'),
  gridFlag(17, 'byrna'),
  gridFlag(18, 'cape'),
  mirrorSpec(),
  ladderSpec(CheatSlot.Gloves, 'lift', 'ability', LADDERS.lift, equipSprite('gloves')),
  abilityFlag(CheatSlot.Boots, 'boots', 'boots'),
  abilityFlag(CheatSlot.Flippers, 'flippers', 'flippers'),
  abilityFlag(CheatSlot.MoonPearl, 'moonPearl', 'moonPearl'),
  ladderSpec(CheatSlot.Sword, 'sword', 'equipment', LADDERS.sword, equipSprite('sword')),
  ladderSpec(CheatSlot.Shield, 'shield', 'equipment', LADDERS.shield, equipSprite('shield')),
  ladderSpec(CheatSlot.Armor, 'mail', 'equipment', LADDERS.mail, equipSprite('armor')),
];

export { buildSlotSpecs };
