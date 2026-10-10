/* @layer shared-game @kind logic */
import type { SimObservation, SimEvent } from '../../types';
import type { EngineEnv } from '../engine.type';
import type { EngineState } from '../state/state.type';
import { syncReachTokens } from '../explorer/sync-reach-tokens';
import { emitEntryTrapSlam } from '../side-effects/emit-entry-trap-slam';
import { unionReach } from '../regions/union-reach';
import { stampReach } from '../regions/stamp-reach';
import { closeIdleDungeonGroups } from '../dungeon-ledger-lifecycle/close-idle-dungeon-groups';
import { queueTargets } from './queue-targets';
import { refreshFrontier } from './refresh-frontier';

const observe = (env: EngineEnv, s: EngineState, obs: SimObservation, events: SimEvent[]): void => {
  s.inventory = new Set(obs.inventory);
  syncReachTokens(s);
  const tile = obs.virtual.screenId === s.virtual.screenId ? obs.virtual.tile : s.virtual.tile;
  s.virtual = { screenId: s.virtual.screenId, tile };
  const firstVisit = !s.everVisited.has(s.virtual.screenId);
  s.visited.add(s.virtual.screenId);
  s.everVisited.add(s.virtual.screenId);
  stampReach(s.regionReach, s.virtual.screenId, s.virtual.tile);
  if (obs.reached) unionReach(s.regionReach, s.virtual.screenId, obs.reached);
  if (firstVisit) emitEntryTrapSlam(s, obs, events);
  queueTargets(s, obs, events);
  refreshFrontier(env, s, obs);
  closeIdleDungeonGroups(s, events);
  s.phase = 'planning';
};

export { observe };
