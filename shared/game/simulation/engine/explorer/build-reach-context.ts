/* @layer shared-game @kind logic */
import type { ReachContext } from '../../requirements-map/requirements-map.type';
import type { EngineState } from '../state/state.type';
import { keyAvailable } from './key-available';

const buildReachContext = (state: EngineState): ReachContext => ({
  tokens: state.reachTokens,
  keyAvailable: dungeon => keyAvailable(state, dungeon),
  bigKeys: state.bigKeys,
  events: state.events,
});

export { buildReachContext };
