/* @layer shared-game @kind logic */
/**
 * EngineState — the full mutable-by-copy state the pure step machine threads
 * through every phase. Created once at run start from the first observation.
 */
import type { TraversalRequirement } from '../../navigation/nav-data.types';
import type { SimConfig, SimOutcome, SimPhase, VirtualLink, FlagSnapshot, TriggerAction } from '../types';

/** A discovered interactable paired with the trigger that fires it. */
interface SimTarget {
  screenId: string;
  roomId: number;
  action: TriggerAction;
  /** Stable identity for de-duping / done-tracking. */
  key: string;
  /** Naming label for the narrative log. */
  label: string;
}

interface EngineState {
  phase: SimPhase;
  step: number;
  epoch: number;
  virtual: VirtualLink;

  /** Item names held (mirrors the game inventory). */
  inventory: Set<string>;
  /** Item-derived traversal tokens (rebuilt from inventory each observation). */
  reachTokens: Set<TraversalRequirement>;
  /** Remaining small keys per dungeon (consumable). */
  keys: Map<string, number>;
  /** Big keys possessed, keyed by dungeon. */
  bigKeys: Set<string>;
  /** Observed done events (gate `event:*` tokens). */
  events: Set<string>;

  /** Screen IDs already explored this run. */
  visited: Set<string>;
  /** Screen IDs reachable but not yet explored (current epoch). */
  frontier: string[];
  /** Every screen reachable this epoch — feeds the softlock report. */
  reachedScreens: Set<string>;

  /** Target keys already triggered. */
  done: Set<string>;
  /** Target keys whose trigger produced no flag change this epoch (retried next epoch). */
  failed: Set<string>;
  /** Verified check names (naming from the matcher) — feeds goal/softlock. */
  completedChecks: Set<string>;
  /** Interactables discovered on the current screen awaiting trigger. */
  pending: SimTarget[];
  currentTarget?: SimTarget;
  /** Remaining screen hops of the active traversal. */
  route: string[];

  /** Flags captured just before the active trigger (for verification diff). */
  preTrigger?: FlagSnapshot;
  /** Whether any check completed since the current epoch started. */
  progressSinceEpoch: boolean;
  stopHit: boolean;
  outcome: SimOutcome | null;
  config: SimConfig;
}

const createEngineState = (virtual: VirtualLink, inventory: Set<string>, config: SimConfig): EngineState => ({
  phase: 'observing',
  step: 0,
  epoch: 0,
  virtual,
  inventory: new Set(inventory),
  reachTokens: new Set(),
  keys: new Map(),
  bigKeys: new Set(),
  events: new Set(),
  visited: new Set([virtual.screenId]),
  frontier: [],
  reachedScreens: new Set([virtual.screenId]),
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

/** Shallow-structural clone so a step never mutates its input state. */
const cloneState = (s: EngineState): EngineState => ({
  ...s,
  inventory: new Set(s.inventory),
  reachTokens: new Set(s.reachTokens),
  keys: new Map(s.keys),
  bigKeys: new Set(s.bigKeys),
  events: new Set(s.events),
  visited: new Set(s.visited),
  frontier: [...s.frontier],
  reachedScreens: new Set(s.reachedScreens),
  done: new Set(s.done),
  failed: new Set(s.failed),
  completedChecks: new Set(s.completedChecks),
  pending: [...s.pending],
  route: [...s.route],
});

export { createEngineState, cloneState };
export type { EngineState, SimTarget };
