/* @layer bridge-wasm @kind logic */
/**
 * Every game state that is ACTIVE right now, as a flat list. The game holds several at once
 * (a follower, sleeping in bed, keys in hand), so this is a registry: adding a state means
 * adding one rule. Everything is read from LIVE game memory (see state_queries.c), never from
 * something the simulator recorded, so a hand-loaded save state reports the truth.
 */

/** The live values the rules read. Plain data, so rules stay testable. */
interface StateSnapshot {
  /** follower_indicator holds the tagalong id, 0 = nobody. */
  follower: number;
  /** progress_buf, as returned by the flag snapshot (a typed array in practice). */
  progress: ArrayLike<number>;
}

interface ActiveState {
  id: string;
  label: string;
  /** Secondary text shown next to the label, such as a count, a name or a caveat. */
  detail?: string;
  /** Tooltip-only provenance (a raw flag mask). Kept out of the chip so labels stay readable. */
  hint?: string;
  /** Rendering hint: states that gate traversal deserve emphasis. */
  gating?: boolean;
}

/** Tagalong ids, named from the routine that sets each (`follower_indicator = N`). Unconfirmed ids are reported by number. */
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

/** `link_num_keys` is 0xFF after leaving a dungeon (overworld.c:429): "no key count here", not 255 keys. */
const NO_KEY_COUNT = 0xff;

/** sram_progress_indicator thresholds for the story beats it counts off. */
const PROGRESS_LABELS: Readonly<Record<number, string>> = {
  1: 'Uncle rescued',
  2: 'Princess rescued',
  3: 'Agahnim defeated',
};

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
  const label = PROGRESS_LABELS[tier];
  return label ? { id: `progress-${tier}`, label } : null;
};

/**
 * What the player is DOING (asleep, dashing, swimming) and the named progress bits come from
 * live player-state bytes, not this SRAM buffer (player-state-rules.ts, merged by `liveGameStates`).
 */
const STATE_RULES: readonly StateRule[] = [
  followerRule, progressRule, bigKeyRule, smallKeyRule,
];

/** Everything currently true, in registry order. Empty when nothing notable holds. */
const activeStates = (snap: StateSnapshot): ActiveState[] =>
  STATE_RULES.map((rule) => rule(snap)).filter((s): s is ActiveState => s !== null);

export { activeStates, TAGALONG_NAMES, SLOT };
export type { ActiveState, StateSnapshot, StateRule };
