/* @layer bridge-wasm @kind logic */
import { createOnlineClient } from './online-client';
import { defaultOnlineCore } from './online-core';
import { createBrowserSocket } from '@rotp/randomizer';
import type { OnlineDeps } from './online-client';
import type { OnlineSession } from '@rotp/randomizer';
import type { OnlineSessionConfig } from '@rotp/randomizer';

const createOnlineSession = (config: OnlineSessionConfig, deps: Partial<OnlineDeps> = {}): OnlineSession =>
  createOnlineClient(config, { core: defaultOnlineCore, createSocket: createBrowserSocket, ...deps });

export { createOnlineSession };
export type { OnlineSession, OnlineSessionConfig };
