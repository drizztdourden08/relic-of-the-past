/* @layer bridge-wasm @kind logic */
import type { SessionCtx } from './session-context.type';

const sendLeave = (ctx: SessionCtx): void => {
  try {
    ctx.link?.send({ type: 'leave' });
  } catch {
    return undefined;
  }
};

export { sendLeave };
