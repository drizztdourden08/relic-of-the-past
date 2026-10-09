/* @layer shared-game @kind logic */
import type { GameScreenId } from './game-id.type';

const hexLabelOf = (gameId: GameScreenId): string => (
  gameId.kind === 'overworld'
    ? `screen 0x${gameId.screen.toString(16).padStart(2, '0')}`
    : `room 0x${gameId.room.toString(16).padStart(2, '0')}`
);

export { hexLabelOf };
