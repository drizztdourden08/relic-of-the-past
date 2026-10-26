/* @layer bridge-wasm @kind logic */
import { createBrowserSocket } from '../../browser-socket';
import { createListenerSet } from '../../listener-set';
import { createReconnector } from '../../reconnect';
import type { JoinConfig, JoinDeps } from '../join/join-config.type';
import { MAX_RECONNECTS } from '../lobby.constants';
import { connectSession } from './connect-session';
import { emitEvent } from './emit-event';
import { freshWire } from './fresh-wire';
import { initialState } from './initial-state';
import type { LobbyJoinState } from './lobby-state.type';
import type { SessionCtx } from './session-context.type';

const createContext = (
  config: JoinConfig,
  deps: JoinDeps,
  settle: (state: LobbyJoinState) => void,
): SessionCtx => {
  const ctx: SessionCtx = {
    config,
    createSocket: deps.createSocket ?? createBrowserSocket,
    maxReconnects: deps.maxReconnects ?? MAX_RECONNECTS,
    world: config.world,
    prepared: { worlds: [], slots: [], files: new Map() },
    state: initialState(config.token ?? null),
    listeners: createListenerSet(),
    link: null,
    wire: freshWire(),
    uploader: null,
    downloads: new Map(),
    reconnector: createReconnector(
      () => connectSession(ctx),
      (delayMs, attempt) => emitEvent(ctx, { type: 'reconnecting', attempt, delayMs }),
    ),
    attempts: 0,
    finished: false,
    settle,
  };
  return ctx;
};

export { createContext };
