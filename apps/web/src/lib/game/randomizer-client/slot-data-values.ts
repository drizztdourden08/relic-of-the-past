/* @layer bridge-wasm @kind logic */
/**
 * The per-seed values a slot's data carries, read into the shapes a local placement keeps:
 * the options snapshot, the two medallion locks, the rolled pond demands and shelf prices, and
 * the deliverable spots the world was built with.
 * A value the slot does not carry, or carries in a shape this game cannot read, is absent,
 * and the caller falls back the way a placement from before that value existed does.
 */
import { normalizeRandomizerOptions } from '@shared/randomizer/options-snapshot';
import { MEDALLION_ITEMS, VANILLA_MEDALLIONS } from '@shared/randomizer/world/item-groups';
import { itemKeyOfName } from '@shared/randomizer/world/display-names/item-key-name';
import { deliverableSetsOf, parseDeliverableLists } from '@shared/randomizer/world/fill/deliverable-lists';
import type { DeliverableSets } from '@shared/randomizer/world/fill/fill-options-from-snapshot';
import type { MedallionId } from '@shared/randomizer/world/item-groups';
import type { ItemKey } from '@shared/randomizer/world/item-ids.data';
import type { RandomizerOptionsSnapshot } from '@shared/randomizer/world/options.type';
import type { PondDemandView } from '@shared/randomizer/world/pond/pond-ask.type';
import type { ShopPriceView } from '@shared/randomizer/world/shops/shop-price.type';
import type { RotpSlotData } from '@shared/randomizer/archipelago/slot-data.type';

type Medallions = { mire: MedallionId; turtleRock: MedallionId };

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const snapshotOfSlot = (slotData: RotpSlotData): RandomizerOptionsSnapshot =>
  normalizeRandomizerOptions({ schema: 'ap-options-v2', values: slotData.options });

/** A medallion arrives as its key or its name; anything else keeps the vanilla lock. */
const medallionOf = (raw: string, fallback: MedallionId): MedallionId => {
  const key = (MEDALLION_ITEMS as readonly string[]).includes(raw) ? raw as ItemKey : itemKeyOfName(raw);
  return (MEDALLION_ITEMS as readonly string[]).includes(key) ? key as MedallionId : fallback;
};

const medallionsOfSlot = (slotData: RotpSlotData): Medallions => ({
  mire: medallionOf(slotData.medallions.mire, VANILLA_MEDALLIONS.mire),
  turtleRock: medallionOf(slotData.medallions.turtleRock, VANILLA_MEDALLIONS.turtleRock),
});

const preRolledPondDemands = (slotData: RotpSlotData): PondDemandView | undefined => {
  const raw = slotData.preRolled?.pondDemands;
  return isPlainRecord(raw) ? raw as PondDemandView : undefined;
};

const preRolledShopPrices = (slotData: RotpSlotData): ShopPriceView | undefined => {
  const raw = slotData.preRolled?.shopPrices;
  return isPlainRecord(raw) ? raw as ShopPriceView : undefined;
};

/** The npc, pond and world spots the slot's world was built with. */
const preRolledDeliverable = (slotData: RotpSlotData): Required<DeliverableSets> | undefined => {
  const lists = parseDeliverableLists(slotData.preRolled?.deliverable);
  return lists === undefined ? undefined : deliverableSetsOf(lists);
};

export { medallionsOfSlot, preRolledDeliverable, preRolledPondDemands, preRolledShopPrices, snapshotOfSlot };
