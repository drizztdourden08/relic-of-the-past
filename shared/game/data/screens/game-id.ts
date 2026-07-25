/* @layer shared-game @kind logic */
/**
 * The link between OUR screen ids and the identifiers the GAME uses.
 *
 * Every screen definition already carries the native values (`roomIndex`, and
 * `dungeon.palaceIndex` for dungeon rooms), but there was no named concept for
 * "the game's id for this screen" and no way to go back the other way. Callers
 * therefore synthesized id strings from a room number — which silently produced
 * ids that match nothing, because an indoor screen is keyed by palace AND room.
 *
 * Use these helpers instead of formatting an id by hand. A screen number alone is
 * never enough to name an indoor screen.
 */
import type { ScreenDefinition } from '../../types';
import { getScreenLookup } from './detection';
import { displayName } from './names-overlay';

/** How the game identifies a screen: an overworld index, or a room (+palace). */
type GameScreenId =
  | { kind: 'overworld'; screen: number }
  | { kind: 'room'; room: number; palace?: number };

/** The game's id for one of our screen definitions, or null when it has no native index. */
const gameScreenIdOf = (screen: ScreenDefinition): GameScreenId | null => {
  const index = screen.roomIndex;
  if (index == null) return null;
  if (screen.type === 'overworld') return { kind: 'overworld', screen: index };
  if (screen.type === 'dungeon') return { kind: 'room', room: index, palace: screen.dungeon.palaceIndex };
  return { kind: 'room', room: index };
};

/**
 * Our screen definition for a game id, resolved in the SAME order as the live
 * detector (`resolveCurrentScreenDetailed`) so the two never disagree:
 *
 *   1. exact `palace:room`
 *   2. any palace holding that room — a safety net for rooms whose dataset
 *      `palaceIndex` does not match the live `cur_palace_index_x2`, which the
 *      detector papers over with the same scan
 *   3. cave / interior by room alone
 *
 * Step 2 is why a palace-qualified id still beats a bare room number: it keeps a
 * dungeon room from resolving to a CAVE that happens to share the number.
 */
const screenForGameId = (gameId: GameScreenId): ScreenDefinition | null => {
  const lookup = getScreenLookup();
  if (gameId.kind === 'overworld') return lookup.byOverworldScreen.get(gameId.screen) ?? null;

  if (gameId.palace !== undefined) {
    const exact = lookup.byDungeonRoom.get(`${gameId.palace}:${gameId.room}`);
    if (exact) return exact;
    for (const [key, screen] of lookup.byDungeonRoom) {
      if (key.endsWith(`:${gameId.room}`)) return screen;
    }
  }
  return lookup.byCaveRoom.get(gameId.room) ?? null;
};

/** Our id string for a game id — the correct replacement for hand-formatting one. */
const screenIdForGameId = (gameId: GameScreenId): string | null => screenForGameId(gameId)?.id ?? null;

/** Display name for a game id, falling back to the raw numbers when unmapped. */
const gameIdLabel = (gameId: GameScreenId): string => {
  const screen = screenForGameId(gameId);
  if (screen) return displayName(screen.id, screen.name);
  return gameId.kind === 'overworld'
    ? `screen 0x${gameId.screen.toString(16).padStart(2, '0')}`
    : `room 0x${gameId.room.toString(16).padStart(2, '0')}`;
};

export { gameScreenIdOf, screenForGameId, screenIdForGameId, gameIdLabel };
export type { GameScreenId };
