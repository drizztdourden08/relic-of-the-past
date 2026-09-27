/* @layer bridge-wasm @kind logic */
/**
 * The real core's answer to a scout: the scouts become a Placement (scouts-to-placement.ts)
 * and the session arms through the one start sequence a local seed uses (session-start.ts),
 * so a solo room and a local seed with the same options set the game up identically. Each
 * location holding another player's item arms the foreign sentinel, with a receipt line
 * naming the item and who it went to. When the core took the pool icons, the sentinel is the
 * icon id of the owner's game, so the hold-up shows that game's icon (foreign-icon-plan.ts).
 *
 * Afterwards the dedup set keeps every location the game grants in-world: every class but
 * deliver. A deliver row's own item comes back through the receive path instead.
 */
import { itemKeyOfApId } from '@shared/randomizer/archipelago/ap-id-lookup';
import { armSessionFromPlacement } from './session-start';
import { scoutsToPlacement } from './scouts-to-placement';
import { baselineEntriesOf } from './baseline-entries';
import { applyForeignIcons } from '../foreign-icons';
import { foreignIconIdOfGame } from './foreign-icon-of-game';
import type { ItemKey } from '@shared/randomizer/world/item-ids.data';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { ForeignItem } from './foreign-item-line';
import type { OnlineCore, ScoutedInput } from './online-core.type';
import type { PhysicalPlan } from './physical-plan.type';
import type { SessionReceiptTexts } from './receipt-text-refresh';

let activeTexts: SessionReceiptTexts | null = null;

const TAG = '[Online]';

const itemKeyOfId = (id: number): ItemKey | undefined => {
  try {
    return itemKeyOfApId(id);
  } catch {
    return undefined;
  }
};

const foreignItemsOf = (input: ScoutedInput): Map<LocationKey, ForeignItem> => {
  const items = new Map<LocationKey, ForeignItem>();
  for (const scout of input.scouts) {
    const key = input.maps.keyByLocationId.get(scout.location);
    if (key === undefined || scout.player === input.slot) continue;
    items.set(key, {
      owner: input.playerName(scout.player),
      item: input.itemName(scout.item, scout.player),
      game: input.gameOf(scout.player),
    });
  }
  return items;
};

const ownersOf = (items: ReadonlyMap<LocationKey, ForeignItem>): Record<string, string> =>
  Object.fromEntries([...items].map(([key, item]) => [key, item.owner]));

const keepInWorld = (plan: PhysicalPlan, input: ScoutedInput): void => {
  const { maps } = input;
  for (const entry of plan.entries) {
    const id = maps.locationIdByKey.get(entry.location);
    if (id !== undefined && entry.planClass === 'deliver') maps.overriddenLocationIds.delete(id);
  }
};

/** Stop following the tracker with the armed lines (session end). */
const stopScoutedTexts = (): void => {
  activeTexts?.stop();
  activeTexts = null;
};

const armScouted: OnlineCore['armScouted'] = async (input) => {
  const { scouts, maps, slot, slotData, seedName, reporter } = input;
  if (slotData === null) return { ok: false, reason: 'the slot data is missing or not this world\'s shape' };
  const placement = scoutsToPlacement({
    scouts, slot, slotData, fallbackSeed: seedName,
    idToLocationKey: (id) => maps.keyByLocationId.get(id), idToItemKey: itemKeyOfId,
  });
  const items = foreignItemsOf(input);
  stopScoutedTexts();
  // Only a core holding the pictures gets icon ids; otherwise the plain sentinel stays.
  const withIcons = items.size > 0 && await applyForeignIcons(TAG);
  const armed = await armSessionFromPlacement(placement, TAG, {
    reporter,
    foreignItemOf: (location) => items.get(location),
    ...(withIcons ? { foreignIconIdOf: (location: LocationKey) => foreignIconIdOfGame(items.get(location)?.game) } : {}),
  });
  if (!armed.ok) return { ok: false, reason: `${armed.plan.errors.length} plan errors (see above)` };
  activeTexts = armed.receiptTexts;
  keepInWorld(armed.plan, input);
  return {
    ok: true, placement, foreignOwners: ownersOf(items),
    pollEntries: [...armed.pollEntries, ...baselineEntriesOf(armed.plan)],
  };
};

export { armScouted, stopScoutedTexts };
