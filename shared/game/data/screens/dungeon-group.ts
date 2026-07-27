/* @layer shared-game @kind logic */
/**
 * Dungeon group id — what the sim's per-dungeon ledger keys on instead of a raw
 * palace index. Every dungeon stands alone under its own index, except one: the
 * sewers (palace index 0) are reachable ONLY through the castle above them
 * (palace index 1), so a run that leaves through the castle and comes back
 * through it must find the sewers' owed checks under the SAME ledger entry.
 * No other palace shares this property — this is a single named exception,
 * not a general grouping rule.
 */
import { SCREEN_BY_ID } from './index';
import type { ScreenDefinition } from '../../types';

/** `palaceIndex` is the raw `cur_palace_index_x2` a screen carries; the game's
 *  own dungeon tables (and this ledger) index by `palaceIndex >> 1`. */
const dungeonGroupOf = (palaceIndex: number): number => {
  const dungeonIndex = palaceIndex >> 1;
  return dungeonIndex === 0 ? 1 : dungeonIndex;
};

/** The dungeon group a screen belongs to, or null when it isn't a dungeon room. */
const dungeonGroupForScreen = (screenId: string): number | null => {
  const screen: ScreenDefinition | undefined = SCREEN_BY_ID.get(screenId);
  if (!screen || screen.type !== 'dungeon') return null;
  return dungeonGroupOf(screen.dungeon.palaceIndex);
};

export { dungeonGroupOf, dungeonGroupForScreen };
