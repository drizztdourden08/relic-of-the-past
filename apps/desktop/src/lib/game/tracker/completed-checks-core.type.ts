/* @layer bridge-wasm @kind types */
import type { ItemId } from '@shared/game/data';

interface ProgressReaders {
  readRoomWord: ((roomId: number) => number) | null;
  readOwByte: ((owScreen: number) => number) | null;
  readProgByte: ((bufferIndex: number) => number) | null;
  readEventByte?: ((byteIndex: number) => number) | null;
  inventory?: ReadonlySet<ItemId> | null;
}

export type { ProgressReaders };
