/* @layer bridge-wasm @kind logic */
import { log } from '../../../log-bus';
import type { OnlineContext } from '@rotp/randomizer';

const requestSync = (ctx: OnlineContext, reason: string): void => {
  if (ctx.room.syncPending) return;
  ctx.room.syncPending = true;
  log.randomizer(`[Online] ${reason}, asking the server for the full list`);
  ctx.send({ cmd: 'Sync' });
};

export { requestSync };
