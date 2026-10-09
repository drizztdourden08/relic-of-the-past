/* @layer tests @kind helper */
import { getScreen } from '@rotp/game-data';

const roomOf = (screenId: string): number | undefined => getScreen(screenId).gameId.roomIndex;

export { roomOf };
