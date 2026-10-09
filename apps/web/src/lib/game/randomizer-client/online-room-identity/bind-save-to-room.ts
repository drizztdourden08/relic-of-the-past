/* @layer bridge-wasm @kind logic */
import { acceptsRoom } from './accepts-room';
import { adoptRoom } from './adopt-room';
import type { OnlineContext } from '../online-context.type';

const bindSaveToRoom = (ctx: OnlineContext): boolean => {
  if (!ctx.core.isFileInPlay()) return true;
  if (!acceptsRoom(ctx)) return false;
  adoptRoom(ctx);
  return true;
};

export { bindSaveToRoom };
