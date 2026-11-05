/* @layer renderer-app @kind logic */
import { foreignIconIdOfGame, stopScoutedTexts, TAG } from '@rotp/randomizer';
import type { ForeignItem, ForeignItemOf, ForeignOwners, LocationKey, Placement } from '@rotp/randomizer';
import type { ForeignHooks } from './rotp-ap-foreign.type';
import type { ApplyContext } from '@drizztdourden08/brock-randomizer/session';
import { applyForeignIcons } from '@app/game/foreign-icons';
import { setForeignOwners } from '@app/game/randomizer-client/session-store/set-foreign-owners';

const foreignItemsOf = (placement: Placement, foreign: NonNullable<ApplyContext['foreign']>): Map<LocationKey, ForeignItem> => {
  const items = new Map<LocationKey, ForeignItem>();
  for (const key of Object.keys(placement.locations) as LocationKey[]) {
    const entry = foreign(key);
    if (entry !== undefined) items.set(key, { owner: entry.playerName, item: entry.itemName, game: entry.gameName });
  }
  return items;
};

const ownersOf = (items: ReadonlyMap<LocationKey, ForeignItem>): ForeignOwners => {
  const owners: Partial<Record<LocationKey, string>> = {};
  for (const [key, entry] of items) owners[key] = entry.owner;
  return owners;
};

const rotpApForeignHooks = async (placement: Placement, ctx: ApplyContext): Promise<ForeignHooks> => {
  if (ctx.foreign === undefined) return {};
  const items = foreignItemsOf(placement, ctx.foreign);
  setForeignOwners(ownersOf(items));
  stopScoutedTexts();
  const coreTookPictures = items.size > 0 && await applyForeignIcons(TAG);
  const foreignItemOf: ForeignItemOf = (location) => items.get(location);
  return coreTookPictures
    ? { foreignItemOf, foreignIconIdOf: (location: LocationKey) => foreignIconIdOfGame(items.get(location)?.game) }
    : { foreignItemOf };
};

export { rotpApForeignHooks };
