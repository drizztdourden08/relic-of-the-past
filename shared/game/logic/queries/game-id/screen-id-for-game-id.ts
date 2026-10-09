/* @layer shared-game @kind logic */
import type { GameScreenId } from './game-id.type';
import { screenForGameId } from './screen-for-game-id';

const screenIdForGameId = (gameId: GameScreenId): string | null => screenForGameId(gameId)?.id ?? null;

export { screenIdForGameId };
