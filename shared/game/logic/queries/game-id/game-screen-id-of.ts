/* @layer shared-game @kind logic */
import type { ScreenRecord } from '../../../data';
import type { GameScreenId } from './game-id.type';

const gameScreenIdOf = (screen: ScreenRecord): GameScreenId | null => {
  const { overworldIndex, roomIndex, palaceIndex } = screen.gameId;
  if (screen.kind === 'overworld' && overworldIndex !== undefined) return { kind: 'overworld', screen: overworldIndex };
  if (roomIndex === undefined) return null;
  return screen.kind === 'dungeon' ? { kind: 'room', room: roomIndex, palace: palaceIndex } : { kind: 'room', room: roomIndex };
};

export { gameScreenIdOf };
