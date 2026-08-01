/* @layer shared-game @kind logic */
/**
 * EngineState — the full mutable-by-copy state the pure step machine threads
 * through every phase. Created once at run start from the first observation.
 *
 * Everything the run HOLDS or has DONE is keyed by dataset id: items by `ItemId`,
 * verified checks by `CheckId`, keys and big keys by `DungeonId`. Display names
 * are not identities here and cannot be stored in any of them — 11 dungeons each
 * hold a check named "Big Chest", so a name-keyed completed set marked all eleven
 * done the moment one was opened, and the key ledger's dungeon was a slug parsed
 * out of an item's parenthetical.
 *
 * Place identity is the simulator's own `TraversalId`, NOT a `ScreenId`.
 */
import type { TraversalRequirement } from '../../navigation/nav-data.types';
import type { GridPos } from '../../navigation/types';
import type { CheckId, DungeonId, ItemId } from '../../data';
import type { SimConfig, SimOutcome, SimPhase, VirtualPlayer, FlagSnapshot, TriggerAction, SimExit, SimArea } from '../types';
import type { TraversalId } from '../traversal-id';
import type { RegionJob } from './regions';
import type { DungeonLedger } from './dungeon-ledger';

/**
 * Whether a target is a thing the run is OWED or a gate that merely explains why
 * something else is blocked. The dungeon ledger used to decide this by matching
 * the target's English noun ("key door", "the princess") against a word list, so
 * rewording a log label silently changed which checks a dungeon was owed.
 */
type SimTargetRole = 'check' | 'gate';

/** A discovered interactable paired with the trigger that fires it. */
interface SimTarget {
  screenId: TraversalId;
  roomId: number;
  action: TriggerAction;
  /** Stable identity for de-duping / done-tracking. */
  key: string;
  /** What this target IS — see SimTargetRole. */
  role: SimTargetRole;
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

  /** Items held (mirrors the game inventory), by dataset id. */
  inventory: Set<ItemId>;
  /** Item-derived traversal tokens (rebuilt from inventory each observation). */
  reachTokens: Set<TraversalRequirement>;
  /** Remaining small keys per dungeon (consumable). */
  keys: Map<DungeonId, number>;
  /** Big keys possessed, by dungeon. */
  bigKeys: Set<DungeonId>;
  /** Observed done events (gate `event:*` tokens). */
  events: Set<string>;

  /** Screens already explored this epoch (cleared by resetFrontier). */
  visited: Set<TraversalId>;
  /** Distinct screens explored across the WHOLE run — the screen-limit basis. */
  everVisited: Set<TraversalId>;
  /**
   * Game-discovered exit graph: screen → exits its flood detected. Once any
   * screen contributes exits, traversal runs on this graph alone (never the
   * static connection dataset).
   */
  discovered: Map<TraversalId, SimExit[]>;
  /** Per-screen union of flood-reached tiles (region memory, run-wide). */
  regionReach: Map<TraversalId, boolean[][]>;
  /** Pending visits into unexplored regions of already-visited screens. */
  regionJobs: RegionJob[];
  /** Screens reachable but not yet explored (current epoch). */
  frontier: TraversalId[];
  /** Every screen reachable this epoch — feeds the softlock report. */
  reachedScreens: Set<TraversalId>;
  /** Ways in already used, as `screenId#edgeSig` — see arrivalKey. */
  arrivals: Set<string>;
  /** Boundaries already crossed, by canonical identity — see crossingKey. A
   *  crossing recognised from either side needs walking only once. */
  crossings: Set<string>;
  /** Where the last hop came from, and the tile it landed on. Crossing a link
   *  uses it up from BOTH ends, and the far end can only be identified once the
   *  destination's own exits are known — see markWayBackUsed. */
  cameFrom: { screenId: TraversalId; tile: GridPos } | null;
  /** Edge signature the current route must arrive through, if pinned. */
  pendingEdgeSig: string | null;

  /** Screens whose trap shutters currently sit slammed shut behind the player. */
  trapClosed: Set<TraversalId>;
  /** Target keys already triggered. */
  done: Set<string>;
  /** Target keys whose trigger produced no flag change this epoch (retried next epoch). */
  failed: Set<string>;
  /** Verified checks, by dataset id — feeds goal/softlock. */
  completedChecks: Set<CheckId>;
  /** Per-dungeon-group ledger of what is still owed there — see dungeon-ledger.ts. */
  ledgers: Map<number, DungeonLedger>;
  /** Interactables discovered on the current screen awaiting trigger. */
  pending: SimTarget[];
  currentTarget?: SimTarget;
  /** Remaining screen hops of the active traversal. */
  route: TraversalId[];

  /** Flags captured just before the active trigger (for verification diff). */
  preTrigger?: FlagSnapshot;
  /** Whether any check completed since the current epoch started. */
  progressSinceEpoch: boolean;
  stopHit: boolean;
  outcome: SimOutcome | null;
  config: SimConfig;
}

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
  crossings: new Set(s.crossings),
  cameFrom: s.cameFrom,
  pendingEdgeSig: s.pendingEdgeSig,
  trapClosed: new Set(s.trapClosed),
  done: new Set(s.done),
  failed: new Set(s.failed),
  completedChecks: new Set(s.completedChecks),
  ledgers: new Map([...s.ledgers].map(([group, ledger]) => [
    group,
    { ...ledger, owed: ledger.owed.map(o => ({ ...o })), reopensOn: [...ledger.reopensOn] },
  ])),
  pending: [...s.pending],
  route: [...s.route],
});

export { createEngineState, cloneState };
export type { EngineState, SimTarget, SimTargetRole };
