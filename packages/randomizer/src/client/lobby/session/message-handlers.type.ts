/* @layer bridge-wasm @kind types */
import type { ServerMessage } from '@archipelia/lobby-protocol';
import type { SessionCtx } from './session-context.type';

type MessageHandlers = {
  [K in ServerMessage['type']]: (ctx: SessionCtx, message: Extract<ServerMessage, { type: K }>) => void;
};

export type { MessageHandlers };
