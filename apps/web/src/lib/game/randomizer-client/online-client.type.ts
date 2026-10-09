/* @layer bridge-wasm @kind types */
import type { CreateSocket } from './ap-socket.type';
import type { OnlineCore } from './online-core.type';

type OnlineDeps = { core: OnlineCore; createSocket: CreateSocket };

export type { OnlineDeps };
