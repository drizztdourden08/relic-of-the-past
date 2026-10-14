/* @layer renderer-widgets @kind logic */
import { getItemByGameId } from '@rotp/game-data';
import { BY_VALUE, LADDERS, MIRROR, SIMPLE } from '@rotp/navigation';
import { CheatSlot } from '@app/game';
import { getSlotSprite } from '@app/composites/PauseItemSlot';
import { EQUIP_SPRITES } from '@app/composites/PauseEquipSlot';
import { BOTTLE_SLOT_INDEX, BOW_RUNG_VALUES, BOW_TOP_VALUE, MIRROR_SLOT_INDEX, RAW_VALUE_LABELS } from '../ItemsTab.constants';
import type { FlagSpecParams, LadderSpecParams, SlotSpec, SpriteOf, TierOption } from '../ItemsTab.type';

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

const flagSpec = (params: FlagSpecParams): SlotSpec => {
  const { slot, nameKey, place, receiveItemId, sprite } = params;
  return { slot, kind: 'flag', nameKey, place, tiers: [noneTier(slot, sprite), tier(slot, 1, sprite, receiveItemId)] };
};

const ladderSpec = (params: LadderSpecParams): SlotSpec => {
  const { slot, nameKey, place, ladder, sprite, rungValues, topValue } = params;
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
  flagSpec({ slot, nameKey, place: 'grid', receiveItemId: SIMPLE[nameKey], sprite: gridSprite(slot) });

const abilityFlag = (slot: number, nameKey: keyof typeof SIMPLE, type: string): SlotSpec =>
  flagSpec({ slot, nameKey, place: 'ability', receiveItemId: SIMPLE[nameKey], sprite: equipSprite(type) });

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
  ladderSpec({
    slot: 0, nameKey: 'bow', place: 'grid', ladder: LADDERS.bow, sprite: gridSprite(0), rungValues: BOW_RUNG_VALUES, topValue: BOW_TOP_VALUE,
  }),
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
  ladderSpec({ slot: CheatSlot.Gloves, nameKey: 'lift', place: 'ability', ladder: LADDERS.lift, sprite: equipSprite('gloves') }),
  abilityFlag(CheatSlot.Boots, 'boots', 'boots'),
  abilityFlag(CheatSlot.Flippers, 'flippers', 'flippers'),
  abilityFlag(CheatSlot.MoonPearl, 'moonPearl', 'moonPearl'),
  ladderSpec({ slot: CheatSlot.Sword, nameKey: 'sword', place: 'equipment', ladder: LADDERS.sword, sprite: equipSprite('sword') }),
  ladderSpec({ slot: CheatSlot.Shield, nameKey: 'shield', place: 'equipment', ladder: LADDERS.shield, sprite: equipSprite('shield') }),
  ladderSpec({ slot: CheatSlot.Armor, nameKey: 'mail', place: 'equipment', ladder: LADDERS.mail, sprite: equipSprite('armor') }),
];

export { buildSlotSpecs };
