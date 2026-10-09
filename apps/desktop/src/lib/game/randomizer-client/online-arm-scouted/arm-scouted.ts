/* @layer bridge-wasm @kind logic */
import { itemKeyOfApId } from '@rotp/randomizer';
import { armSessionFromPlacement } from '../session-start';
import { scoutsToPlacement } from '@rotp/randomizer';
import { baselineEntriesOf } from '@rotp/randomizer';
import { applyForeignIcons } from '../../foreign-icons';
import { foreignIconIdOfGame } from '@rotp/randomizer';
import type { ItemKey } from '@rotp/randomizer';
import type { LocationKey } from '@rotp/randomizer';
import type { ForeignItem } from '@rotp/randomizer';
import type { OnlineCore, ScoutedInput } from '@rotp/randomizer';
import type { PhysicalPlan } from '@rotp/randomizer';
import { foreignItemsOf } from '@rotp/randomizer';
import { TAG } from '@rotp/randomizer';
import { scoutedTextsState } from '@rotp/randomizer';
import { stopScoutedTexts } from '@rotp/randomizer';

const itemKeyOfId = (id: number): ItemKey | undefined => {
  try {
    return itemKeyOfApId(id);
  } catch {
    return undefined;
  }
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

const armScouted: OnlineCore['armScouted'] = async (input) => {
  const { scouts, maps, slot, slotData, seedName, reporter } = input;
  if (slotData === null) return { ok: false, reason: 'the slot data is missing or not this world\'s shape' };
  const placement = scoutsToPlacement({
    scouts, slot, slotData, fallbackSeed: seedName,
    idToLocationKey: (id) => maps.keyByLocationId.get(id), idToItemKey: itemKeyOfId,
  });
  const items = foreignItemsOf(input);
  stopScoutedTexts();
  const coreTookPictures = items.size > 0 && await applyForeignIcons(TAG);
  const armed = await armSessionFromPlacement(placement, TAG, {
    reporter,
    foreignItemOf: (location) => items.get(location),
    ...(coreTookPictures ? { foreignIconIdOf: (location: LocationKey) => foreignIconIdOfGame(items.get(location)?.game) } : {}),
  });
  if (!armed.ok) return { ok: false, reason: `${armed.plan.errors.length} plan errors (see above)` };
  scoutedTextsState.active = armed.receiptTexts;
  keepInWorld(armed.plan, input);
  return {
    ok: true, placement, foreignOwners: ownersOf(items),
    pollEntries: [...armed.pollEntries, ...baselineEntriesOf(armed.plan)],
  };
};

export { armScouted };
