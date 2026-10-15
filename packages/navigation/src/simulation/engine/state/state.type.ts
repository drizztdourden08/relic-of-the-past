/* @layer shared-game @kind types */
import type { TraversalRequirement, CheckId, DungeonId, ItemId } from '@rotp/game-data';
import type { GridPos } from '@rotp/game-core';
import type { SimConfig, SimOutcome, SimPhase, VirtualPlayer, FlagSnapshot, TriggerAction, SimExit, SimArea } from '../../types';
import type { TraversalId } from '../../traversal-id.type';
import type { RegionJob } from '../regions/regions.type';
import type { DungeonLedger } from '../dungeon-ledger/dungeon-ledger.type';

type SimTargetRole = 'check' | 'gate';

interface SimTarget {
  screenId: TraversalId;
  roomId: number;
  action: TriggerAction;
  key: string;
  role: SimTargetRole;
  label: string;
  noun: string;
  verb: string;
  tile?: GridPos;
  trap?: boolean;
}

interface EngineState {
  phase: SimPhase;
  step: number;
  epoch: number;
  virtual: VirtualPlayer;
  area?: SimArea;

  inventory: Set<ItemId>;
  reachTokens: Set<TraversalRequirement>;
  keys: Map<DungeonId, number>;
  bigKeys: Set<DungeonId>;
  events: Set<string>;

  visited: Set<TraversalId>;
  everVisited: Set<TraversalId>;
  discovered: Map<TraversalId, SimExit[]>;
  regionReach: Map<TraversalId, boolean[][]>;
  regionJobs: RegionJob[];
  frontier: TraversalId[];
  reachedScreens: Set<TraversalId>;
  arrivals: Set<string>;
  crossings: Set<string>;
  cameFrom: { screenId: TraversalId; tile: GridPos } | null;
  pendingEdgeSig: string | null;

  trapClosed: Set<TraversalId>;
  done: Set<string>;
  failed: Set<string>;
  completedChecks: Set<CheckId>;
  ledgers: Map<number, DungeonLedger>;
  pending: SimTarget[];
  currentTarget?: SimTarget;
  route: TraversalId[];

  preTrigger?: FlagSnapshot;
  progressSinceEpoch: boolean;
  stopHit: boolean;
  outcome: SimOutcome | null;
  config: SimConfig;
}

export type { SimTarget, EngineState };
