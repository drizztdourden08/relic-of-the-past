/* @layer shared-game @kind logic */
import { get } from '../../../data';

const gameNumberOf = (id: string): number => {
  const gameId = get('screen', id)?.gameId;
  return gameId?.roomIndex ?? gameId?.overworldIndex ?? -1;
};

export { gameNumberOf };
