/* @layer bridge-wasm @kind logic */
import type { OnlineContext } from '../online-context.type';

const adoptRoom = (ctx: OnlineContext): void => {
  const { room, core } = ctx;
  if (room.roomHash !== null && core.readRoomHash() === 0) core.writeRoomHash(room.roomHash);
};

export { adoptRoom };
