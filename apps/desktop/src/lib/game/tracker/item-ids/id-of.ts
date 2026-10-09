/* @layer bridge-wasm @kind logic */
import { getItemByGameId } from '@shared/game/data';
import type { ItemId } from '@shared/game/data';

const idOf = (receiveItemId: number): ItemId | undefined => getItemByGameId({ receiveItemId })?.id;

export { idOf };
