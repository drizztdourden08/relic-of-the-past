/* @layer bridge-wasm @kind logic */
import type { SessionFactory } from '@drizztdourden08/brock-randomizer/session';
import { normalizeServerUrl } from '@rotp/randomizer';
import { createOnlineSession } from '../online-session';
import { onlineConfigOfProfile } from '../online-config-of-profile';
import { gateOnline } from './gate-online';
import { onlineAllowed } from './online-allowed-slot';
import { NOT_ALLOWED, NO_SERVER_URL } from './rotp-online-factory.constants';
import { wireOnlineSession } from './wire-online-session';

const rotpOnlineFactory: SessionFactory = {
  mode: 'online',
  placementBacked: false,
  gate: gateOnline,
  create: (pending) => wireOnlineSession(createOnlineSession(onlineConfigOfProfile(pending.config))),
  allowsStart: () => onlineAllowed.current,
  blockedReason: (config) => {
    if (!onlineAllowed.current) return NOT_ALLOWED;
    return normalizeServerUrl(config.serverUrl ?? '') ? null : NO_SERVER_URL;
  },
};

export { rotpOnlineFactory };
