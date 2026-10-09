/* @layer shared-hub @kind types */
import type { Provider } from '../providers';
import type { SiteAccess, SiteId } from '../site-types';

type AccessState = 'admin' | 'member' | 'pending' | 'revoked';

type AccessSource = 'admin-list' | 'manual-grant' | 'discord-role' | 'github-collaborator' | 'open' | 'none';

type AccessCheck = {
  state: AccessState;
  source: AccessSource;
  checkedAt: number;
};

type HubUser = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  sites: Partial<Record<SiteId, SiteAccess>>;
  groupIds: string[];
  roleGroupIds: string[];
  sessionVersion: number;
  createdAt: number;
};

type Identity = {
  id: string;
  userId: string;
  provider: Provider;
  subject: string;
  handle: string;
  email: string | null;
  linkedAt: number;
};

type AccessGrant = {
  userId: string;
  by: string;
  note: string;
  at: number;
};

type SavedView = {
  id: string;
  userId: string;
  surface: string;
  name: string;
  snapshot: unknown;
  updatedAt: number;
};

export type { AccessState, AccessSource, AccessCheck, HubUser, Identity, AccessGrant, SavedView };
