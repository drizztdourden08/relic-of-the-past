/* @layer bridge-wasm @kind logic */
import type { LobbyProblem } from '../failure';
import { failSession } from './fail-session';
import { sendLeave } from './send-leave';
import type { SessionCtx } from './session-context.type';

const abandonJoin = (ctx: SessionCtx, problem: LobbyProblem): void => {
  sendLeave(ctx);
  failSession(ctx, { ...problem, forgetToken: true });
};

export { abandonJoin };
