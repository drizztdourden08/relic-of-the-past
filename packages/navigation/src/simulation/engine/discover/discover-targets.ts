/* @layer shared-game @kind logic */
import type { SimObservation } from '../../types';
import { discoverBombableWalls } from '../discover-bombs/discover-bombable-walls';
import type { Reached } from '../discover-reach/discover-reach.type';
import type { EngineState, SimTarget } from '../state/state.type';
import { discoverScope } from './discover-scope';
import { chestTargets } from './chest-targets';
import { doorTargets } from './door-targets';
import { spriteTargets } from './sprite-targets';
import { clearRoomTarget } from './clear-room-target';

const discoverTargets = (state: EngineState, obs: SimObservation, reached: Reached): SimTarget[] => {
  const inter = obs.interactables;
  if (!inter) return [];
  const scope = discoverScope(state, obs, reached, inter);
  const clear = clearRoomTarget(scope);
  return [
    ...chestTargets(scope),
    ...(scope.hasBombs ? discoverBombableWalls(state, obs, reached) : []),
    ...doorTargets(scope),
    ...spriteTargets(scope),
    ...(clear ? [clear] : []),
  ];
};

export { discoverTargets };
