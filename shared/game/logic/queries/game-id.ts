/* @layer shared-game @kind logic */
/**
 * The link between OUR screen ids and the identifiers the GAME uses. Moved
 * from data/screens/game-id.ts — now a thin wrapper over getScreenByGameId,
 * with the "any palace holding that room" fallback preserved (a dataset
 * palaceIndex that disagrees with the live cur_palace_index_x2 must still
 * resolve, or a dungeon room could resolve to a cave sharing its room number).
 */
import { find, getScreenByGameId } from '../../data';
import type { ScreenGameId, ScreenRecord } from '../../data';

/** How the game identifies a screen: an overworld index, or a room (+palace). */
type GameScreenId =
  | { kind: 'overworld'; screen: number }
  | { kind: 'room'; room: number; palace?: number };

/** The game's id for one of our screen records, or null when it has no native index. */
const gameScreenIdOf = (screen: ScreenRecord): GameScreenId | null => {
  const { overworldIndex, roomIndex, palaceIndex } = screen.gameId;
  if (screen.kind === 'overworld' && overworldIndex !== undefined) return { kind: 'overworld', screen: overworldIndex };
  if (roomIndex === undefined) return null;
  return screen.kind === 'dungeon' ? { kind: 'room', room: roomIndex, palace: palaceIndex } : { kind: 'room', room: roomIndex };
};

/**
 * Our screen record for a game id:
 *   1. exact `palace:room`
 *   2. any palace holding that room — a safety net for rooms whose dataset
 *      palaceIndex does not match the live cur_palace_index_x2
 *   3. cave / interior by room alone
 */
const screenForGameId = (gameId: GameScreenId): ScreenRecord | undefined => {
  if (gameId.kind === 'overworld') return getScreenByGameId({ overworldIndex: gameId.screen });

  if (gameId.palace !== undefined) {
    const exact = getScreenByGameId({ roomIndex: gameId.room, palaceIndex: gameId.palace });
    if (exact) return exact;
    const anyPalace = find('screen', s => s.gameId.roomIndex === gameId.room && s.gameId.palaceIndex !== undefined);
    if (anyPalace[0]) return anyPalace[0];
  }
  return getScreenByGameId({ roomIndex: gameId.room });
};

/** Our id string for a game id — the correct replacement for hand-formatting one. */
const screenIdForGameId = (gameId: GameScreenId): string | null => screenForGameId(gameId)?.id ?? null;

/** Display name for a game id, falling back to the raw numbers when unmapped. */
const gameIdLabel = (gameId: GameScreenId): string => {
  const screen = screenForGameId(gameId);
  if (screen) return screen.vanillaName ?? screen.randomizerName;
  return gameId.kind === 'overworld'
    ? `screen 0x${gameId.screen.toString(16).padStart(2, '0')}`
    : `room 0x${gameId.room.toString(16).padStart(2, '0')}`;
};

export { gameScreenIdOf, screenForGameId, screenIdForGameId, gameIdLabel };
export type { GameScreenId };
