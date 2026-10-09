/* @layer bridge-wasm @kind logic */
import { itemKeyOfApId } from '@shared/randomizer/archipelago/ap-id-lookup';
import { armSessionFromPlacement } from '../session-start';
import { scoutsToPlacement } from '../scouts-to-placement';
import { baselineEntriesOf } from '../baseline-entries';
import { applyForeignIcons } from '../../foreign-icons';
import { foreignIconIdOfGame } from '../foreign-icon-of-game';
import type { ItemKey } from '@shared/randomizer/world/item-ids.data';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { ForeignItem } from '../foreign-item-line';
import type { OnlineCore, ScoutedInput } from '../online-core.type';
import type { PhysicalPlan } from '../physical-plan.type';
import { foreignItemsOf } from './foreign-items-of';
import { TAG } from './online-arm-scouted.constants';
import { scoutedTextsState } from './scouted-texts-state';
import { stopScoutedTexts } from './stop-scouted-texts';

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
