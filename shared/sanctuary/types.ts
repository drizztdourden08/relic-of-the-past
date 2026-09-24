/* @layer shared-sanctuary @kind types */
/**
 * Identity and access records of the Sanctuary: the user, the provider identities bound to
 * it, the manual access grant and the per-user saved views. File and device records live in
 * file-types.ts and device-types.ts; reports in report-types.ts.
 */
import type { Provider } from './providers';

type AccessState = 'admin' | 'member' | 'pending' | 'revoked';

/** Which rule of the access chain matched; 'none' goes with the pending state. */
type AccessSource = 'admin-list' | 'manual-grant' | 'discord-role' | 'github-collaborator' | 'none';

type AccessCheck = {
  state: AccessState;
  source: AccessSource;
  /** Epoch ms of the last run of the access chain. */
  checkedAt: number;
};

type SanctuaryUser = {
  /** Firestore doc id, never a provider id. */
  id: string;
  /** From the first identity, editable. */
  displayName: string;
  avatarUrl: string | null;
  access: AccessCheck;
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

type ViewSurface = 'files' | 'reports';

/**
 * A named FilterBar + DataTable arrangement, per user, per surface. The snapshot is the
 * renderer's ViewSnapshot (columns, sort, group by, filters). It stays `unknown` here because
 * shared/ never imports the renderer design system; the site and the API narrow it at the edge.
 */
type SavedView = {
  id: string;
  userId: string;
  surface: ViewSurface;
  name: string;
  snapshot: unknown;
  updatedAt: number;
};

export type { AccessState, AccessSource, AccessCheck, SanctuaryUser, Identity, AccessGrant, ViewSurface, SavedView };
