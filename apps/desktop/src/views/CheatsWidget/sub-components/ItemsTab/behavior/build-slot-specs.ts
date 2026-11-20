/* @layer renderer-widgets @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { getItemByGameId } from '@rotp/game-data';
import { BY_VALUE, LADDERS, MIRROR, SIMPLE } from '@rotp/navigation';
import { CheatSlot } from '@app/game';
import { getSlotSprite } from '@app/composites/PauseItemSlot';
import { EQUIP_SPRITES } from '@app/composites/PauseEquipSlot';
import { BOTTLE_SLOT_INDEX, BOW_RUNG_VALUES, BOW_TOP_VALUE, MIRROR_SLOT_INDEX, RAW_VALUE_LABELS } from '../ItemsTab.constants';
import { ITEM_NAME_BY_ID } from './item-name-messages.constants';
import type { FlagSpecParams, LadderSpecParams, SlotSpec, SpriteOf, TierOption } from '../ItemsTab.type';
import type { ByValueSpecParams, SlotArt, TextOf } from './build-slot-specs.type';

const gridSprite = (slot: number): SpriteOf => (value) => getSlotSprite(slot, value);
const equipSprite = (type: string): SpriteOf => (value) => EQUIP_SPRITES[type]?.[value] ?? null;

const labelOf = (text: TextOf, slot: number, value: number, receiveItemId?: number): string => {
  const raw = RAW_VALUE_LABELS[slot]?.[value];
  if (raw) return text(raw);
  const named = receiveItemId === undefined ? undefined : ITEM_NAME_BY_ID[receiveItemId];
  if (named) return text(named);
  const record = receiveItemId === undefined ? undefined : getItemByGameId({ receiveItemId });
  return record?.name ?? text(msg('views-cheats:tier.value', { n: value }));
};

const noneTier = (text: TextOf, slot: number, sprite: SpriteOf): TierOption => ({
  value: 0, label: text(RAW_VALUE_LABELS[slot]?.[0] ?? msg('views-cheats:tier.none')), sprite: sprite(0),
});

const tier = (text: TextOf, art: SlotArt, value: number, receiveItemId?: number): TierOption =>
  ({ value, label: labelOf(text, art.slot, value, receiveItemId), sprite: art.sprite(value), receiveItemId });

const flagSpec = (text: TextOf, params: FlagSpecParams): SlotSpec => {
  const { slot, nameKey, place, receiveItemId, sprite } = params;
  return { slot, kind: 'flag', nameKey, place, tiers: [noneTier(text, slot, sprite), tier(text, { slot, sprite }, 1, receiveItemId)] };
};

const ladderSpec = (text: TextOf, params: LadderSpecParams): SlotSpec => {
  const { slot, nameKey, place, ladder, sprite, rungValues, topValue } = params;
  const tiers: TierOption[] = [noneTier(text, slot, sprite)];
  const last = topValue ?? ladder.length;
  for (let value = 1; value <= last; value++) {
    const rung = rungValues ? rungValues.indexOf(value) : value - 1;
    tiers.push(tier(text, { slot, sprite }, value, rung >= 0 ? ladder[rung] : undefined));
  }
  return { slot, kind: 'ladder', nameKey, place, tiers };
};

const byValueSpec = (text: TextOf, params: ByValueSpecParams): SlotSpec => {
  const { slot, nameKey, table, sprite } = params;
  return {
    slot, kind: 'byValue', nameKey, place: 'grid',
    tiers: [
      noneTier(text, slot, sprite),
      ...Object.entries(table).map(([value, receiveItemId]) => tier(text, { slot, sprite }, Number(value), receiveItemId)),
    ],
  };
};

const gridFlag = (text: TextOf, slot: number, nameKey: keyof typeof SIMPLE): SlotSpec =>
  flagSpec(text, { slot, nameKey, place: 'grid', receiveItemId: SIMPLE[nameKey], sprite: gridSprite(slot) });

const abilityFlag = (text: TextOf, slot: number, nameKey: keyof typeof SIMPLE, type: string): SlotSpec =>
  flagSpec(text, { slot, nameKey, place: 'ability', receiveItemId: SIMPLE[nameKey], sprite: equipSprite(type) });

const mirrorSpec = (text: TextOf): SlotSpec => {
  const sprite = gridSprite(MIRROR_SLOT_INDEX);
  const art = { slot: MIRROR_SLOT_INDEX, sprite };
  return {
    slot: MIRROR_SLOT_INDEX, kind: 'ladder', nameKey: 'mirror', place: 'grid',
    tiers: [noneTier(text, MIRROR_SLOT_INDEX, sprite), tier(text, art, 1), tier(text, art, 2, MIRROR)],
  };
};

const bottleSpec = (): SlotSpec => ({
  slot: BOTTLE_SLOT_INDEX, kind: 'bottle', nameKey: 'bottle', place: 'grid', tiers: [],
});

const buildSlotSpecs = (text: TextOf): SlotSpec[] => [
  ladderSpec(text, {
    slot: 0, nameKey: 'bow', place: 'grid', ladder: LADDERS.bow, sprite: gridSprite(0), rungValues: BOW_RUNG_VALUES, topValue: BOW_TOP_VALUE,
  }),
  byValueSpec(text, { slot: 1, nameKey: 'boomerang', table: BY_VALUE.boomerang, sprite: gridSprite(1) }),
  gridFlag(text, 2, 'hookshot'),
  gridFlag(text, 3, 'bombs'),
  byValueSpec(text, { slot: 4, nameKey: 'mushroom', table: BY_VALUE.mushroom, sprite: gridSprite(4) }),
  gridFlag(text, 5, 'fireRod'),
  gridFlag(text, 6, 'iceRod'),
  gridFlag(text, 7, 'bombos'),
  gridFlag(text, 8, 'ether'),
  gridFlag(text, 9, 'quake'),
  gridFlag(text, 10, 'lamp'),
  gridFlag(text, 11, 'hammer'),
  byValueSpec(text, { slot: 12, nameKey: 'flute', table: BY_VALUE.flute, sprite: gridSprite(12) }),
  gridFlag(text, 13, 'bugNet'),
  gridFlag(text, 14, 'book'),
  bottleSpec(),
  gridFlag(text, 16, 'somaria'),
  gridFlag(text, 17, 'byrna'),
  gridFlag(text, 18, 'cape'),
  mirrorSpec(text),
  ladderSpec(text, { slot: CheatSlot.Gloves, nameKey: 'lift', place: 'ability', ladder: LADDERS.lift, sprite: equipSprite('gloves') }),
  abilityFlag(text, CheatSlot.Boots, 'boots', 'boots'),
  abilityFlag(text, CheatSlot.Flippers, 'flippers', 'flippers'),
  abilityFlag(text, CheatSlot.MoonPearl, 'moonPearl', 'moonPearl'),
  ladderSpec(text, { slot: CheatSlot.Sword, nameKey: 'sword', place: 'equipment', ladder: LADDERS.sword, sprite: equipSprite('sword') }),
  ladderSpec(text, { slot: CheatSlot.Shield, nameKey: 'shield', place: 'equipment', ladder: LADDERS.shield, sprite: equipSprite('shield') }),
  ladderSpec(text, { slot: CheatSlot.Armor, nameKey: 'mail', place: 'equipment', ladder: LADDERS.mail, sprite: equipSprite('armor') }),
];

export { buildSlotSpecs };
