/* @layer bridge-wasm @kind logic */
/**
 * Synthesizes tracker-facing CheckRecord-shaped entries for every AP-world
 * location this seed placed an item at that no real CheckRecord backs (shop
 * shelves at every restock depth, chiefly). Built fresh per placement so the
 * widget's total always matches exactly what THIS seed generated, never a
 * smaller fixed dataset that silently drops whole categories.
 *
 * A virtual record carries no gameId (there is nothing to poll: its status
 * comes from the availability engine and the fire-id ledger, both already
 * keyed by the raw AP location name), and `kind: 'npc'` is a placeholder
 * class for the "type" facet, not a detection claim.
 */
import { SHOP_DEFS } from '@shared/randomizer/ap-world/shops/shops.data';
import { checkIdByStandardName, standardCheckName } from './check-names';
import type { ApPlacement } from '@shared/randomizer/ap-world/fill/ap-placement.type';
import type { CheckId, CheckRecord, ScreenId } from '@shared/game/data';

/** Shop def name -> the screen its building stands on (screens/*\/shops.ts), for world/area grouping. */
const SHOP_SCREEN_BY_NAME: Readonly<Record<string, ScreenId>> = {
  'Kakariko Shop': 'screen-199',
  'Cave Shop (Lake Hylia)': 'screen-214',
  'Light World Death Mountain Shop': 'screen-213',
  'Potion Shop': 'screen-220',
  'Village of Outcasts Shop': 'screen-482',
  'Dark Lake Hylia Shop': 'screen-483',
  'Dark World Lumberjack Shop': 'screen-475',
  'Dark World Potion Shop': 'screen-478',
  'Red Shield Shop': 'screen-476',
  'Big Bomb Shop': 'screen-466',
  'Cave Shop (Dark Death Mountain)': 'screen-453',
};

/** A shop-slot location's name is always its shop's own name plus a position suffix. */
const shopScreenFor = (locationName: string): ScreenId | undefined => {
  const def = SHOP_DEFS.find((shop) => locationName.startsWith(shop.name));
  return def ? SHOP_SCREEN_BY_NAME[def.name] : undefined;
};

const slugOf = (name: string): string => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** The synthetic id a virtual check gets for a given AP location name. Shared
 * with placement-view.ts so a virtual check's row and its placed-item lookup
 * can never drift onto two different ids for the same location. */
const virtualCheckIdOf = (locationName: string): CheckId => `check-virtual-${slugOf(locationName)}` as CheckId;

/** One cache slot: placements don't change mid-session, and this only ever runs against the active one. */
let cached: { placement: ApPlacement; records: CheckRecord[] } | null = null;

/**
 * Every location in the placement's nameView with no real CheckId, as a
 * plain CheckRecord the grouping/filter/stats code (all generic over
 * CheckRecord fields) already knows how to render without any changes.
 */
const virtualChecksOf = (placement: ApPlacement): CheckRecord[] => {
  if (cached?.placement === placement) return cached.records;
  const records: CheckRecord[] = [];
  for (const name of Object.keys(placement.nameView)) {
    if (checkIdByStandardName(name) !== undefined) continue;
    const screenId = shopScreenFor(name);
    records.push({
      id: virtualCheckIdOf(name),
      gameId: {},
      kind: 'npc',
      screenId,
      randomizerName: name,
      vanillaItemIds: [],
    });
  }
  cached = { placement, records };
  return records;
};

/**
 * The check roster for a randomized session: every real CheckRecord this
 * seed's own placement actually names, plus a virtual one for every location
 * none of them cover. A handful of our checks (the intro's own story beats:
 * "Link Wakes Up", "Rescued Zelda") track real vanilla progress but were
 * never AP-world locations at all, so counting them here would inflate the
 * total past what the seed actually generated; they stay in the base
 * checkRecords array untouched for the vanilla profile that DOES want them.
 */
const apAlignedCheckRecords = (checkRecords: readonly CheckRecord[], placement: ApPlacement): CheckRecord[] => {
  const real = checkRecords.filter((check) => placement.nameView[standardCheckName(check.id)] !== undefined);
  return [...real, ...virtualChecksOf(placement)];
};

export { apAlignedCheckRecords, virtualChecksOf, virtualCheckIdOf };
