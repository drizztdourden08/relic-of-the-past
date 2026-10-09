/* @layer shared-game @kind logic */
import type { ItemId } from '../../../data';
import type { SimConfig, VirtualPlayer } from '../../types';
import type { EngineState } from './state.type';

const createEngineState = (virtual: VirtualPlayer, inventory: ReadonlySet<ItemId>, config: SimConfig): EngineState => ({
  phase: 'observing',
  step: 0,
  epoch: 0,
  virtual,
  inventory: new Set(inventory),
  reachTokens: new Set(),
  keys: new Map(),
  bigKeys: new Set(),
  events: new Set(),
  ledgers: new Map(),
  visited: new Set([virtual.screenId]),
  everVisited: new Set([virtual.screenId]),
  discovered: new Map(),
  regionReach: new Map(),
  regionJobs: [],
  frontier: [],
  reachedScreens: new Set([virtual.screenId]),
  arrivals: new Set(),
  crossings: new Set(),
  cameFrom: null,
  pendingEdgeSig: null,
  trapClosed: new Set(),
  done: new Set(),
  failed: new Set(),
  completedChecks: new Set(),
  pending: [],
  route: [],
  progressSinceEpoch: false,
  stopHit: false,
  outcome: null,
  config,
});

export { createEngineState };
