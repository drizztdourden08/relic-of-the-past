/* @layer shared-game @kind logic */
/**
 * EngineState — the full mutable-by-copy state the pure step machine threads
 * through every phase. Created once at run start from the first observation.
 */
import type { TraversalRequirement } from '../../navigation/nav-data.types';
import type { GridPos } from '../../navigation/types';
import type { SimConfig, SimOutcome, SimPhase, VirtualPlayer, FlagSnapshot, TriggerAction, SimExit, SimArea } from '../types';
import type { RegionJob } from './regions';

/** A discovered interactable paired with the trigger that fires it. */
interface SimTarget {
  screenId: string;
  roomId: number;
  action: TriggerAction;
  /** Stable identity for de-duping / done-tracking. */
  key: string;
  /** Naming label for the narrative log. */
  label: string;
  /** Interactable noun for the log ("chest", NPC kind). */
  noun: string;
  /** Trigger verb for the log ("Opening", "Talking to"). */
  verb: string;
  /** Flood-grid tile the interactable sits on, when its position is known. */
  tile?: GridPos;
  /** Interacting walks into a live trap section — shutters slam shut behind the player first. */
  trap?: boolean;
}

interface EngineState {
  phase: SimPhase;
  step: number;
  epoch: number;
  virtual: VirtualPlayer;
  /** Big multi-sub-screen area the virtual player currently stands in (log grouping). */
  area?: SimArea;

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

  /** Screen IDs already explored this epoch (cleared by resetFrontier). */
  visited: Set<string>;
  /** Distinct screen IDs explored across the WHOLE run — the screen-limit basis. */
  everVisited: Set<string>;
  /**
   * Game-discovered exit graph: screenId → exits its flood detected. Once any
   * screen contributes exits, traversal runs on this graph alone (never the
   * static connection dataset).
   */
  discovered: Map<string, SimExit[]>;
  /** Per-screen union of flood-reached tiles (region memory, run-wide). */
  regionReach: Map<string, boolean[][]>;
  /** Pending visits into unexplored regions of already-visited screens. */
  regionJobs: RegionJob[];
  /** Screen IDs reachable but not yet explored (current epoch). */
  frontier: string[];
  /** Every screen reachable this epoch — feeds the softlock report. */
  reachedScreens: Set<string>;
  /** Ways in already used, as `screenId#edgeSig` — see arrivalKey. */
  arrivals: Set<string>;

  /** Screens whose trap shutters currently sit slammed shut behind the player. */
  trapClosed: Set<string>;
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

const createEngineState = (virtual: VirtualPlayer, inventory: Set<string>, config: SimConfig): EngineState => ({
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
  everVisited: new Set([virtual.screenId]),
  discovered: new Map(),
  regionReach: new Map(),
  regionJobs: [],
  frontier: [],
  reachedScreens: new Set([virtual.screenId]),
  arrivals: new Set(),
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

/** Shallow-structural clone so a step never mutates its input state. */
const cloneState = (s: EngineState): EngineState => ({
  ...s,
  inventory: new Set(s.inventory),
  reachTokens: new Set(s.reachTokens),
  keys: new Map(s.keys),
  bigKeys: new Set(s.bigKeys),
  events: new Set(s.events),
  visited: new Set(s.visited),
  everVisited: new Set(s.everVisited),
  discovered: new Map(s.discovered),
  regionReach: new Map(s.regionReach),
  regionJobs: [...s.regionJobs],
  frontier: [...s.frontier],
  reachedScreens: new Set(s.reachedScreens),
  arrivals: new Set(s.arrivals),
  trapClosed: new Set(s.trapClosed),
  done: new Set(s.done),
  failed: new Set(s.failed),
  completedChecks: new Set(s.completedChecks),
  pending: [...s.pending],
  route: [...s.route],
});

export { createEngineState, cloneState };
export type { EngineState, SimTarget };
