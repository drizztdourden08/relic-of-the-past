/* @layer hub-core @kind logic */
import { FieldValue } from '@google-cloud/firestore';
import type { HubUser, SiteAccess, SiteId } from '@rotp/hub-contracts';
import { collection, now } from './firestore';
import { ACCESS_STATES } from './users-repo.constants';
import type { SignUpProfile, StoredUser, UserSummary } from './users-repo.type';

const users = () => collection('users');

const withDefaults = (stored: StoredUser): HubUser => ({
  ...stored,
  sites: stored.sites ?? {},
  groupIds: stored.groupIds ?? [],
  roleGroupIds: stored.roleGroupIds ?? [],
});

const create = async ({ handle, avatarUrl }: SignUpProfile): Promise<HubUser> => {
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

const saveSiteAccess = async (id: string, site: SiteId, access: SiteAccess, roleGroupIds: string[]): Promise<void> => {
  await users().doc(id).update({ [`sites.${site}`]: access, roleGroupIds });
};

const setGroups = async (id: string, groupIds: string[]): Promise<void> => {
  await users().doc(id).update({ groupIds });
};

const bumpSessionVersion = async (id: string): Promise<number> => {
  const user = await get(id);
  const sessionVersion = (user?.sessionVersion ?? 0) + 1;
  await users().doc(id).update({ sessionVersion });
  return sessionVersion;
};

const listForSite = async (site: SiteId): Promise<HubUser[]> => {
  const snap = await users().where(`sites.${site}.state`, 'in', ACCESS_STATES).orderBy('createdAt', 'asc').get();
  return snap.docs.map((doc) => withDefaults(doc.data() as StoredUser));
};

const listAll = async (): Promise<HubUser[]> => {
  const snap = await users().orderBy('createdAt', 'asc').get();
  return snap.docs.map((doc) => withDefaults(doc.data() as StoredUser));
};

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
