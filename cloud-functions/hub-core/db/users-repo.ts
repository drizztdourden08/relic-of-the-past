/* @layer hub-core @kind logic */
/** Users. A record stored before groups existed reads with empty group lists, and the
 *  first write that touches them stores the fields. Each site keeps its own record under
 *  `sites.<id>`, written by that site's access check. */
import { FieldValue } from '@google-cloud/firestore';
import type { AccessCheck, AccessState, HubUser, SiteAccess, SiteId } from '../../../shared/hub';
import { collection, now } from './firestore';

type NewUserProfile = { handle: string; avatarUrl: string | null };
type UserSummary = { userId: string; displayName: string };
/** A record from before sites held their own access carries the Sanctuary's answer at its top level. */
type StoredUser = Omit<HubUser, 'groupIds' | 'roleGroupIds' | 'sites'> &
  Partial<Pick<HubUser, 'groupIds' | 'roleGroupIds' | 'sites'>> & { access?: AccessCheck };

const ACCESS_STATES: readonly AccessState[] = ['admin', 'member', 'pending', 'revoked'];

const users = () => collection('users');

const sitesOf = ({ sites, access, createdAt }: StoredUser): HubUser['sites'] => {
  if (sites?.sanctuary || !access) return sites ?? {};
  return { ...sites, sanctuary: { ...access, firstSeenAt: createdAt } };
};

const withDefaults = (stored: StoredUser): HubUser => {
  const { access: _legacy, ...user } = stored;
  return {
    ...user,
    sites: sitesOf(stored),
    groupIds: stored.groupIds ?? [],
    roleGroupIds: stored.roleGroupIds ?? [],
  };
};

const create = async ({ handle, avatarUrl }: NewUserProfile): Promise<HubUser> => {
  const ref = users().doc();
  const user: HubUser = {
    id: ref.id,
    displayName: handle,
    avatarUrl,
    sites: {},
    groupIds: [],
    roleGroupIds: [],
    sessionVersion: 1,
    createdAt: now(),
  };
  await ref.set(user);
  return user;
};

const get = async (id: string): Promise<HubUser | null> => {
  const snap = await users().doc(id).get();
  return snap.exists ? withDefaults(snap.data() as StoredUser) : null;
};

const summary = async (id: string): Promise<UserSummary> => {
  const user = await get(id);
  return { userId: id, displayName: user?.displayName ?? 'unknown' };
};

/** One write for one site's access answer and the groups the chain read from Discord and GitHub. */
const saveSiteAccess = async (id: string, site: SiteId, access: SiteAccess, roleGroupIds: string[]): Promise<void> => {
  await users().doc(id).update({ [`sites.${site}`]: access, roleGroupIds });
};

/** The manual memberships, replacing the list. */
const setGroups = async (id: string, groupIds: string[]): Promise<void> => {
  await users().doc(id).update({ groupIds });
};

const bumpSessionVersion = async (id: string): Promise<number> => {
  const user = await get(id);
  const sessionVersion = (user?.sessionVersion ?? 0) + 1;
  await users().doc(id).update({ sessionVersion });
  return sessionVersion;
};

/** Everyone holding a record on this site, whatever its state, oldest first. */
const listForSite = async (site: SiteId): Promise<HubUser[]> => {
  const snap = await users().where(`sites.${site}.state`, 'in', ACCESS_STATES).orderBy('createdAt', 'asc').get();
  return snap.docs.map((doc) => withDefaults(doc.data() as StoredUser));
};

const listAll = async (): Promise<HubUser[]> => {
  const snap = await users().orderBy('createdAt', 'asc').get();
  return snap.docs.map((doc) => withDefaults(doc.data() as StoredUser));
};

/** Drops a group from every user holding it, by hand or by role; answers who was touched. */
const removeGroup = async (groupId: string): Promise<string[]> => {
  const [manual, byRole] = await Promise.all([
    users().where('groupIds', 'array-contains', groupId).get(),
    users().where('roleGroupIds', 'array-contains', groupId).get(),
  ]);
  const ids = Array.from(new Set([...manual.docs, ...byRole.docs].map((doc) => doc.id)));
  const change = { groupIds: FieldValue.arrayRemove(groupId), roleGroupIds: FieldValue.arrayRemove(groupId) };
  await Promise.all(ids.map((id) => users().doc(id).update(change)));
  return ids;
};

const usersRepo = {
  create,
  get,
  summary,
  saveSiteAccess,
  setGroups,
  bumpSessionVersion,
  listForSite,
  listAll,
  removeGroup,
};

export { usersRepo };
export type { NewUserProfile, UserSummary };
