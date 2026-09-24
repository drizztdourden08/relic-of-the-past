/* @layer sanctuary-site @kind logic */
/**
 * The session context: what the site knows about the signed-in user. Filled by
 * SessionProvider, read by the guard, the shell and every page through useSessionContext.
 */
import { createContext, useContext } from 'react';
import type { SanctuaryUser, Identity, AccessCheck } from '@shared/sanctuary/types';
import type { Group, Rights } from '@shared/sanctuary/group-types';

type Session = {
  /** The signed-in user, or null when there is no session. */
  me: SanctuaryUser | null;
  /** The user's access state; null with no session. */
  access: AccessCheck | null;
  identities: Identity[];
  /** The groups the user is in, by hand, from Discord or by the default fallback. */
  groups: Group[];
  /** What the user may see: the union of their groups, everything for an admin. Null with no session. */
  rights: Rights | null;
  /** True until the first GET /me answers. */
  loading: boolean;
  /** The last error from GET /me, shown when the API is unreachable. */
  error: string | null;
  /** Re-runs GET /me. */
  refresh: () => Promise<void>;
  /** POST /auth/signout, then clears the session. */
  signOut: (everywhere?: boolean) => Promise<void>;
};

const SessionContext = createContext<Session | null>(null);

const useSessionContext = (): Session => {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSessionContext: no SessionProvider above');
  return session;
};

export { SessionContext, useSessionContext };
export type { Session };
