/* @layer renderer-stores @kind types */
import type { SiteId } from '@rotp/hub-contracts';
import type { HubMe } from '@app/ipc';

type HubSessionState = 'signed-out' | 'waiting' | 'signed-in';

interface HubSessionStore {
  me: HubMe | null;
  state: HubSessionState;
  userCode: string | null;
  lastError: string | null;
  refresh: () => Promise<void>;
  signIn: (site?: SiteId) => Promise<void>;
  cancel: () => Promise<void>;
  signOut: () => Promise<void>;
}

export type { HubSessionState, HubSessionStore };
