/* @layer bridge-wasm @kind logic */
import { getItemByGameId } from '@rotp/game-data';
import type { ItemId } from '@rotp/game-data';

const idOf = (receiveItemId: number): ItemId | undefined => getItemByGameId({ receiveItemId })?.id;

export { idOf };
