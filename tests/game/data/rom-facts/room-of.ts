/* @layer tests @kind helper */
import { getScreen } from '@shared/game/data';

const roomOf = (screenId: string): number | undefined => getScreen(screenId).gameId.roomIndex;

export { roomOf };
