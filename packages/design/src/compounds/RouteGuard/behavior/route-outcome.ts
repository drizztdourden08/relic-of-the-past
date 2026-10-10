/* @layer site-kit @kind logic */
import { hasRight } from '@rotp/hub-contracts';
import type { Rights, SiteAccess } from '@rotp/hub-contracts';
import type { RouteEntry } from '../../../router/route-table';
import type { Session } from '../../../session/session-context';
import type { RouteOutcome } from './route-outcome.type';

const isWaiting = (access: SiteAccess | null) => !access || access.state === 'pending' || access.state === 'revoked';

const lacksAdmin = (entry: RouteEntry, access: SiteAccess | null) => entry.access === 'admin' && access?.state !== 'admin';

const lacksRight = (entry: RouteEntry, rights: Rights | null) => entry.permission !== undefined && !hasRight(rights, entry.permission);

const routeOutcome = (entry: RouteEntry, session: Pick<Session, 'me' | 'access' | 'rights'>): RouteOutcome => {
  const { me, access, rights } = session;
  if (!me) return entry.access === 'public' ? 'bare' : 'sign-in';
  if (entry.access === 'public') return 'root';
  if (isWaiting(access)) return 'pending';
  if (lacksAdmin(entry, access)) return 'root';
  if (lacksRight(entry, rights)) return 'home';
  return entry.bare ? 'bare' : 'framed';
};

export { routeOutcome };
