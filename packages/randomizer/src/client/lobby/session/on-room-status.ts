/* @layer bridge-wasm @kind logic */
import type { RoomStatus } from '@archipelia/lobby-protocol';
import { emitEvent } from './emit-event';
import type { SessionCtx } from './session-context.type';

const onRoomStatus = (ctx: SessionCtx, message: RoomStatus): void => {
  emitEvent(ctx, { type: 'room', state: message.state, address: message.address ?? null });
};

export { onRoomStatus };
