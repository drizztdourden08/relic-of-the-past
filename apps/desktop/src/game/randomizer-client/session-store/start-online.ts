/* @layer bridge-wasm @kind logic */
import { createOnlineSession } from '../online-session';
import { activateSession } from './activate-session';
import { wireOnlineSession } from './wire-online-session';
import type { OnlineSessionConfig } from '../online-session';
import type { SessionSource } from './session-store.type';

const startOnline = async (config: OnlineSessionConfig, source: SessionSource): Promise<void> => {
  await activateSession(wireOnlineSession(createOnlineSession(config)), source, null);
};

export { startOnline };
