/* @layer renderer-stores @kind types */
import type { Text } from '@drizztdourden08/brock-core/i18n';
import type { SiteId } from '@rotp/hub-contracts';
import type { HubMe } from '@app/ipc';

type HubSessionState = 'signed-out' | 'waiting' | 'signed-in';

interface HubSessionStore {
  me: HubMe | null;
  state: HubSessionState;
  userCode: string | null;
  lastError: Text | null;
  refresh: () => Promise<void>;
  signIn: (site?: SiteId) => Promise<void>;
  cancel: () => Promise<void>;
  signOut: () => Promise<void>;
}

export type { HubSessionStore };
