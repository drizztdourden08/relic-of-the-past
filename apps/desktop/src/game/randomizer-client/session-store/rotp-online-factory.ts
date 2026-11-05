/* @layer bridge-wasm @kind logic */
import type { SessionFactory } from '@drizztdourden08/brock-randomizer/session';
import { createOnlineSession } from '../online-session';
import { onlineConfigOfProfile } from '../online-config-of-profile';
import { gateOnline } from './gate-online';
import { onlineAllowed } from './online-allowed-slot';
import { wireOnlineSession } from './wire-online-session';

const BLOCKED_REASON = 'Archipelago requires Experimental Features in Contributing settings';

const rotpOnlineFactory: SessionFactory = {
  mode: 'online',
  placementBacked: false,
  gate: gateOnline,
  create: (pending) => wireOnlineSession(createOnlineSession(onlineConfigOfProfile(pending.config))),
  allowsStart: () => onlineAllowed.current,
  blockedReason: () => (onlineAllowed.current ? null : BLOCKED_REASON),
};

export { rotpOnlineFactory };
