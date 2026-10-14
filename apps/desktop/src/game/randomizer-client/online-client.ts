/* @layer bridge-wasm @kind logic */
import type { OnlineDeps, OnlineSession, OnlineSessionConfig } from '@rotp/randomizer';
import { buildOnlineSession } from './online-client-kit/build-online-session';
import { createClientKit } from './online-client-kit/create-client-kit';
import { createLinkController } from './online-client-kit/create-link-controller';

const createOnlineClient = (config: OnlineSessionConfig, deps: OnlineDeps): OnlineSession => {
  const kit = createClientKit(config, deps);
  return buildOnlineSession(kit, createLinkController(kit));
};

export { createOnlineClient };
export type { OnlineDeps } from '@rotp/randomizer';
