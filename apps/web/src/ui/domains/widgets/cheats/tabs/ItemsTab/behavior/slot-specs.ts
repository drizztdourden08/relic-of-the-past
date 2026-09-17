/* @layer renderer-widgets @kind logic */
/**
 * One SlotSpec per pause slot, built from the tracker's receive-id tables and the pause sprite
 * tables. Nothing here is retyped: a ladder's rungs, a by-value pick and a held flag all come from
 * item-ids.ts, the sprites from the pause slot components, the labels from the item records.
 * Built per call because a published dataset bundle can replace the records under the labels.
 */
import { getItemByGameId } from '@shared/game/data';
import { BY_VALUE, LADDERS, MIRROR, SIMPLE } from '@app/lib/game/tracker/item-ids';
import { CheatSlot } from '@app/lib/game';
import { getSlotSprite } from '@domains/hud/composites/PauseItemSlot';
import { EQUIP_SPRITES } from '@domains/hud/composites/PauseEquipSlot';
import { BOTTLE_SLOT_INDEX, BOW_RUNG_VALUES, RAW_VALUE_LABELS } from '../ItemsTab.constants';
import type { SlotPlace, SlotSpec, TierOption } from '../ItemsTab.type';

type SpriteOf = (value: number) => string | null;

const gridSprite = (slot: number): SpriteOf => (value) => getSlotSprite(slot, value);
const equipSprite = (type: string): SpriteOf => (value) => EQUIP_SPRITES[type]?.[value] ?? null;

const labelOf = (slot: number, value: number, receiveItemId?: number): string => {
  const raw = RAW_VALUE_LABELS[slot]?.[value];
  if (raw) return raw;
  // The game's own name first: the randomizer name of a fighter's shield reads "Blue Shield".
  const record = receiveItemId === undefined ? undefined : getItemByGameId({ receiveItemId });
  return record?.vanillaName ?? record?.randomizerName ?? `Value ${value}`;
};

/** The empty tier. A slot whose zero draws a sprite (armor) names it instead of "None". */
const noneTier = (slot: number, sprite: SpriteOf): TierOption => ({
  value: 0, label: RAW_VALUE_LABELS[slot]?.[0] ?? 'None', sprite: sprite(0),
});

const tier = (slot: number, value: number, sprite: SpriteOf, receiveItemId?: number): TierOption =>
  ({ value, label: labelOf(slot, value, receiveItemId), sprite: sprite(value), receiveItemId });

const flagSpec = (slot: number, nameKey: string, place: SlotPlace, receiveItemId: number, sprite: SpriteOf): SlotSpec => ({
  slot, kind: 'flag', nameKey, place,
  tiers: [noneTier(slot, sprite), tier(slot, 1, sprite, receiveItemId)],
});

/** Rung i of the ladder is held at byte value i + 1, unless the slot says otherwise (the bow). */
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

/** The mirror byte: 1 is the scroll it starts as, 2 the mirror the receipt hands over. */
const mirrorSpec = (): SlotSpec => {
  const sprite = gridSprite(19);
  return {
    slot: 19, kind: 'ladder', nameKey: 'mirror', place: 'grid',
    tiers: [noneTier(19, sprite), tier(19, 1, sprite), tier(19, 2, sprite, MIRROR)],
  };
};

const bottleSpec = (): SlotSpec => ({
  slot: BOTTLE_SLOT_INDEX, kind: 'bottle', nameKey: 'bottle', place: 'grid', tiers: [],
});

const buildSlotSpecs = (): SlotSpec[] => [
  ladderSpec(0, 'bow', 'grid', LADDERS.bow, gridSprite(0), BOW_RUNG_VALUES, 4),
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

/** Lookup by slot number, for the editors that address a slot by where it sits. */
const specBySlot = (specs: SlotSpec[]): Map<number, SlotSpec> => new Map(specs.map((spec) => [spec.slot, spec]));

/** A tier that draws nothing holds nothing: picking it is the removal. */
const isRemoval = (option: TierOption): boolean => option.value === 0 && option.sprite === null;

export { buildSlotSpecs, isRemoval, specBySlot };
