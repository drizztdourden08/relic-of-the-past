/* @layer bridge-wasm @kind logic */
import { checkHello, validateMessage } from '@archipelia/lobby-protocol';
import { downloadFile } from '../files/download-file';
import { closeSession } from '../session/close-session';
import { connectSession } from '../session/connect-session';
import { createContext } from '../session/create-context';
import { failSession } from '../session/fail-session';
import { leaveSession } from '../session/leave-session';
import { sendReady } from '../session/send-ready';
import { setSlots } from '../session/set-slots';
import type { LobbyJoinState } from '../session/lobby-state.type';
import type { LobbySession } from '../session/lobby-session.type';
import type { SessionCtx } from '../session/session-context.type';
import { buildHello } from './build-hello';
import type { JoinConfig, JoinDeps } from './join-config.type';
import { prepareJoin } from './prepare-join';

const helloProblem = (ctx: SessionCtx): { message: string; field?: string } | null => {
  const hello = buildHello(ctx.config, ctx.prepared, null, 1);
  const schema = validateMessage('c2s', hello)[0];
  if (schema !== undefined) return { message: schema.message, field: schema.path };
  const rule = checkHello(hello);
  return rule === null ? null : { message: rule.message, field: rule.field };
};

const begin = async (ctx: SessionCtx): Promise<void> => {
  ctx.prepared = await prepareJoin(ctx.config.world, ctx.config.slots);
  const problem = helloProblem(ctx);
  if (problem === null) {
    connectSession(ctx);
    return;
  }
  failSession(ctx, { code: 'metadata-missing', forgetToken: false, ...problem });
};

const joinLobby = (config: JoinConfig, deps: JoinDeps = {}): LobbySession => {
  let settle: (state: LobbyJoinState) => void = () => undefined;
  const ended = new Promise<LobbyJoinState>((resolve) => { settle = resolve; });
  const ctx = createContext(config, deps, settle);
  void begin(ctx);
  return {
    get state() { return ctx.state; },
    ended,
    subscribe: (listener) => ctx.listeners.add(listener),
    setReady: (ready) => sendReady(ctx, ready),
    setSlots: (update) => setSlots(ctx, update),
    downloadFile: (fileId) => downloadFile(ctx, fileId),
    leave: () => leaveSession(ctx),
    close: () => closeSession(ctx),
  };
};

export { joinLobby };
