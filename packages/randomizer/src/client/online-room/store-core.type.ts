/* @layer bridge-wasm @kind types */
import type { OnlineCore } from '../online-core.type';

type StoreCore = Pick<OnlineCore, 'readReceivedIndex' | 'writeReceivedIndex' | 'readRoomHash' | 'writeRoomHash'>;

export type { StoreCore };
