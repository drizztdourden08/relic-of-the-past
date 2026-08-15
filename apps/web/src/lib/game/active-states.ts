/* @layer bridge-wasm @kind logic */
/**
 * Every game state that is ACTIVE right now, as a flat list.
 *
 * A follower in tow was the first one we needed, but the game holds several such
 * states at once — a follower, sleeping in bed, keys in hand — so this is a
 * registry rather than a single boolean. Adding a state means adding one rule;
 * nothing else changes, and the widget renders whatever comes back.
 *
 * Everything is read from LIVE game memory (the flag snapshot mirrors real
 * variables — see state_queries.c), never from something the simulator recorded.
 * A save state loaded by hand therefore reports the truth.
 */
import { progressTierLabel } from '@shared/game/logic/queries/progress-tier';

/** The live values the rules read. Plain data, so rules stay testable. */
interface StateSnapshot {
  /** follower_indicator — the tagalong id, 0 = nobody. */
  follower: number;
  /** progress_buf, as returned by the flag snapshot (a typed array in practice). */
  progress: ArrayLike<number>;
}

interface ActiveState {
  id: string;
  label: string;
  /** Secondary text shown next to the label — a count, a name, a caveat. */
  detail?: string;
  /** Tooltip-only provenance (a raw flag mask) — kept out of the chip so labels stay readable. */
  hint?: string;
  /** Rendering hint: states that gate traversal deserve emphasis. */
  gating?: boolean;
}

/**
 * Tagalong ids, named from the routine that sets each one in the decompilation
 * (`follower_indicator = N`). Ids with no confirmed source are reported by number
 * rather than guessed at.
 */
const TAGALONG_NAMES: Readonly<Record<number, string>> = {
  1: 'Princess',
  4: 'Old Man',
  5: 'Uncle',
  6: 'Crystal Maiden',
  7: "Blacksmith's frog",
  9: 'Locksmith',
  10: 'Kiki',
  12: 'Purple Chest',
  13: 'Super Bomb',
};

/** progress_buf slot map (state_queries.c). */
const SLOT = {
  progressIndicator: 0,
  progressFlags: 1,
  follower: 13,
  smallKeys: 14,
  bigKey: 15,
} as const;

/**
 * `link_num_keys` is set to 0xFF on leaving a dungeon (overworld.c:429), meaning
 * "no key count here" — not 255 keys.
 */
const NO_KEY_COUNT = 0xff;

/**
 * Tier 0 is the state every save starts in, so it is not something that has
 * become true — the chip list only reports what holds beyond the opening.
 */
const FIRST_REPORTED_TIER = 1;

type StateRule = (snap: StateSnapshot) => ActiveState | null;

const followerRule: StateRule = (snap) => {
  if (!snap.follower) return null;
  const name = TAGALONG_NAMES[snap.follower];
  return {
    id: 'follower',
    label: name ? `${name} following` : `Follower #${snap.follower} following`,
    ...(name ? {} : { detail: 'unmapped tagalong id' }),
    // A follower can open a gate (the throne-room push wall), so it matters to reach.
    gating: true,
  };
};

const bigKeyRule: StateRule = (snap) => (snap.progress[SLOT.bigKey]
  ? { id: 'big-key', label: 'Big key held', gating: true }
  : null);

const smallKeyRule: StateRule = (snap) => {
  const keys = snap.progress[SLOT.smallKeys] ?? 0;
  if (keys === 0 || keys === NO_KEY_COUNT) return null;
  return { id: 'small-keys', label: `${keys} small key${keys > 1 ? 's' : ''}`, gating: true };
};

const progressRule: StateRule = (snap) => {
  const tier = snap.progress[SLOT.progressIndicator] ?? 0;
  if (tier < FIRST_REPORTED_TIER) return null;
  const label = progressTierLabel(tier);
  return label ? { id: `progress-${tier}`, label } : null;
};

/**
 * What the player is DOING (asleep, dashing, swimming…) and the named progress bits come
 * from live player-state bytes, not this SRAM buffer — see player-state-rules.ts.
 * They are merged in by `liveGameStates`.
 */
const STATE_RULES: readonly StateRule[] = [
  followerRule, progressRule, bigKeyRule, smallKeyRule,
];

/** Everything currently true, in registry order. Empty when nothing notable holds. */
const activeStates = (snap: StateSnapshot): ActiveState[] =>
  STATE_RULES.map((rule) => rule(snap)).filter((s): s is ActiveState => s !== null);

export { activeStates, TAGALONG_NAMES, SLOT };
export type { ActiveState, StateSnapshot, StateRule };
