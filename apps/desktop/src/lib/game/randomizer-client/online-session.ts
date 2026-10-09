/* @layer bridge-wasm @kind logic */
import { createOnlineClient } from './online-client';
import { defaultOnlineCore } from './online-core';
import { createBrowserSocket } from './browser-socket';
import type { OnlineDeps } from './online-client';
import type { OnlineSession } from './online-session.type';
import type { OnlineSessionConfig } from './online-session-config.type';

const createOnlineSession = (config: OnlineSessionConfig, deps: Partial<OnlineDeps> = {}): OnlineSession =>
  createOnlineClient(config, { core: defaultOnlineCore, createSocket: createBrowserSocket, ...deps });

export { createOnlineSession };
export type { OnlineSession, OnlineSessionConfig };
