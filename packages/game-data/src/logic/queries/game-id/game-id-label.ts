/* @layer shared-game @kind logic */
import type { GameScreenId } from './game-id.type';
import { hexLabelOf } from './hex-label-of';
import { screenForGameId } from './screen-for-game-id';

const gameIdLabel = (gameId: GameScreenId): string => screenForGameId(gameId)?.name ?? hexLabelOf(gameId);

export { gameIdLabel };
