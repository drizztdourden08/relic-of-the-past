/* @layer shared-types @kind types */
import type { Identity, SiteUser } from '@rotp/hub-contracts';

type HubMe = {
  user: SiteUser;
  identities: Identity[];
  deviceLabel: string;
};

interface HubInvokeContract {
  'hub:signOut': () => Promise<void>;
  'hub:me': () => Promise<HubMe | null>;
}

export type { HubInvokeContract, HubMe };
