/* @layer bridge-wasm @kind logic */
import { ROOM_MISMATCH } from './online-room-identity.constants';
import type { OnlineContext } from '../online-context.type';

const acceptsRoom = (ctx: OnlineContext): boolean => {
  const { room, core } = ctx;
  const saved = core.readRoomHash();
  if (saved === 0 || room.roomHash === null || saved === room.roomHash) return true;
  ctx.fail(ROOM_MISMATCH);
  return false;
};

export { acceptsRoom };
