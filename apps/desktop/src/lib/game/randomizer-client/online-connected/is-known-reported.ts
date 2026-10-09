/* @layer bridge-wasm @kind logic */
import type { LocationKey } from '@shared/randomizer/world/location-key';
import { GOAL_CHECK } from '../online-goal';
import type { OnlineContext } from '../online-context.type';

const isKnownReported = (ctx: OnlineContext, key: LocationKey): boolean => {
  if (key === GOAL_CHECK && ctx.goal.reached) return true;
  const id = ctx.maps.locationIdByKey.get(key);
  if (id === undefined) return key !== GOAL_CHECK;
  return ctx.room.checked.has(id);
};

export { isKnownReported };
