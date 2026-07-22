/* @layer shared-game @kind types */
/**
 * PresenceCondition — a declarative expression over live game state that decides
 * whether a check-giving NPC is actually spawned at the current game progress.
 *
 * ── The sanctioned exception to "detection is data-free" ──
 * The simulator's rule is that WHAT exists and WHAT happened come from raw game
 * reads, never from our data (see plans/gameplay-simulator.md, "Hard rule:
 * detection is data-free"). Per-NPC spawn logic is the ONE place that rule can't
 * hold: the game decides an NPC's presence inside hardcoded C prep functions
 * (e.g. `Uncle_InPassage` checking `sram_progress_flags & 0x10`), and that
 * decision cannot be recovered from a raw read of the sprite table alone — the
 * static spawn table lists progress-conditional sprites (the intro Uncle, King
 * Zora before Flippers) that are NOT present once the game's condition flips.
 * So we transcribe those conditions as declarative DATA on the checks and the
 * simulator evaluates them. This is deliberate and documented as the single
 * data-read the otherwise data-free detector is allowed.
 *
 * The set of check-giving NPCs is small and fixed; MOST are unconditional
 * (present whenever their room is reachable) and carry no condition. Only the
 * handful whose C prep function gates on game state need an entry here.
 *
 * Design: a minimal recursive union, each leaf naming exactly one readable state
 * source. `and` / `or` / `not` compose leaves for the few multi-part conditions
 * (Old Man, Locksmith). An absent condition means "always present".
 */

/** Whether a bit(mask) must be clear (all zero) or set (any bit present). */
type BitState = 'clear' | 'set';

type PresenceCondition =
  /** sram_progress_flags (0xF3C6): the masked bit(s) must be clear/set. */
  | { progressFlag: number; state: BitState }
  /** sram_progress_indicator_3 (0xF3C9): the masked bit(s) must be clear/set. */
  | { progressIndicator3: number; state: BitState }
  /** Inventory item held (by tracker name), or explicitly NOT held. */
  | { item: string; owned: boolean }
  /** follower_indicator (tagalong id) is 0 — no follower in tow. */
  | { follower: 'none' }
  /** follower_indicator equals a specific tagalong id. */
  | { followerEq: number }
  /** save_ow_event_info[screen]: the masked bit(s) must be clear/set. */
  | { owEvent: { screen: number; mask: number }; state: BitState }
  /** save_dung_info[roomId] boss/room-cleared bit (0x8000) matches `dead`. */
  | { roomBossDead: number; dead: boolean }
  | { and: PresenceCondition[] }
  | { or: PresenceCondition[] }
  | { not: PresenceCondition };

export type { PresenceCondition, BitState };
