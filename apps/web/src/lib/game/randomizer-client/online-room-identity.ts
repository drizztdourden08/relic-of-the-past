/* @layer bridge-wasm @kind logic */
/**
 * A save belongs to one multiworld room. The save keeps the room's hash (room-hash.ts): zero
 * until the save first meets a room, when that room's hash is written, and a save
 * holding another room's hash takes nothing from this one. Its received index counts a
 * different list, so delivering against it would hand out the wrong items.
 */
import type { OnlineContext } from './online-context.type';

const ROOM_MISMATCH = '[Online] This save belongs to another Archipelago room';

/** Whether the save in play may take this room's items; ends the session when it may not. */
const acceptsRoom = (ctx: OnlineContext): boolean => {
  const { room, core } = ctx;
  const saved = core.readRoomHash();
  if (saved === 0 || room.roomHash === null || saved === room.roomHash) return true;
  ctx.fail(ROOM_MISMATCH);
  return false;
};

/** A save with no room yet is bound to this one, at its first granted item. */
const adoptRoom = (ctx: OnlineContext): void => {
  const { room, core } = ctx;
  if (room.roomHash !== null && core.readRoomHash() === 0) core.writeRoomHash(room.roomHash);
};

/**
 * Runs on Connected and after every save swap, before any check is reported or item
 * delivered: a save with no room is bound to this one at once, and a save of another room
 * ends the session before it sends that room's checks here. With no file in play there is
 * no save to judge yet; entering one is a save swap.
 */
const bindSaveToRoom = (ctx: OnlineContext): boolean => {
  if (!ctx.core.isFileInPlay()) return true;
  if (!acceptsRoom(ctx)) return false;
  adoptRoom(ctx);
  return true;
};

export { acceptsRoom, adoptRoom, bindSaveToRoom, ROOM_MISMATCH };
