/* @layer shared-hub @kind types */
/**
 * Identity and access records of the shared accounts: the user, the provider identities
 * bound to it, the manual access grant and the per-user saved views. Device records live
 * in device-types.ts, groups in group-types.ts.
 */
import type { Provider } from './providers';
import type { SiteAccess, SiteId } from './site-types';

type AccessState = 'admin' | 'member' | 'pending' | 'revoked';

/** Which rule of the access chain matched; 'none' goes with the pending state, 'open' with an open site. */
type AccessSource = 'admin-list' | 'manual-grant' | 'discord-role' | 'github-collaborator' | 'open' | 'none';

type AccessCheck = {
  state: AccessState;
  source: AccessSource;
  /** Epoch ms of the last run of the access chain. */
  checkedAt: number;
};

type HubUser = {
  /** Firestore doc id, never a provider id. */
  id: string;
  /** From the first identity, editable. */
  displayName: string;
  avatarUrl: string | null;
  /** One record per site the person signed in to. */
  sites: Partial<Record<SiteId, SiteAccess>>;
  /** Groups an admin put this person in by hand. They never change on their own. */
  groupIds: string[];
  /** Groups from the Discord roles the person held at the last sign-in or re-check. */
  roleGroupIds: string[];
  /** Bumped to sign the user out everywhere. */
  sessionVersion: number;
  createdAt: number;
};

type Identity = {
  /** `${provider}:${subject}`, so a provider account binds to one user only. */
  id: string;
  userId: string;
  provider: Provider;
  /** Discord user id, GitHub user id, Google sub. */
  subject: string;
  /** Username, login or email; display only. */
  handle: string;
  email: string | null;
  linkedAt: number;
};

/** One user, granted by hand from the admin queue. */
type AccessGrant = {
  userId: string;
  /** User id of the admin who granted. */
  by: string;
  note: string;
  at: number;
};

/**
 * A named FilterBar + DataTable arrangement, per user, per surface. The surface is a name
 * each site checks against its own list. The snapshot is the renderer's ViewSnapshot
 * (columns, sort, group by, filters). It stays `unknown` here because shared/ never imports
 * the renderer design system; the site and the API narrow it at the edge.
 */
type SavedView = {
  id: string;
  userId: string;
  surface: string;
  name: string;
  snapshot: unknown;
  updatedAt: number;
};

export type { AccessState, AccessSource, AccessCheck, HubUser, Identity, AccessGrant, SavedView };
