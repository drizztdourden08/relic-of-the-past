/* @layer root-config @kind logic */
/** Users. A record stored before groups existed reads with empty group lists,
 *  and the first write that touches them stores the fields. */
import { FieldValue } from '@google-cloud/firestore';
import type { AccessCheck, AccessState, SanctuaryUser } from '../../../../shared/sanctuary';
import { collection, now } from './firestore';

type NewUserProfile = { handle: string; avatarUrl: string | null };
type UserSummary = { userId: string; displayName: string };
type StoredUser = Omit<SanctuaryUser, 'groupIds' | 'roleGroupIds'> & Partial<Pick<SanctuaryUser, 'groupIds' | 'roleGroupIds'>>;

const users = () => collection('users');

const withGroups = (stored: StoredUser): SanctuaryUser => ({
  ...stored,
  groupIds: stored.groupIds ?? [],
  roleGroupIds: stored.roleGroupIds ?? [],
});

const create = async ({ handle, avatarUrl }: NewUserProfile): Promise<SanctuaryUser> => {
  const ref = users().doc();
  const user: SanctuaryUser = {
    id: ref.id,
    displayName: handle,
    avatarUrl,
    access: { state: 'pending', source: 'none', checkedAt: now() },
    groupIds: [],
    roleGroupIds: [],
    sessionVersion: 1,
    createdAt: now(),
  };
  await ref.set(user);
  return user;
};

const get = async (id: string): Promise<SanctuaryUser | null> => {
  const snap = await users().doc(id).get();
  return snap.exists ? withGroups(snap.data() as StoredUser) : null;
};

const summary = async (id: string): Promise<UserSummary> => {
  const user = await get(id);
  return { userId: id, displayName: user?.displayName ?? 'unknown' };
};

/** One write for the access chain's answer and the groups it read from Discord and GitHub. */
const saveAccess = async (id: string, access: AccessCheck, roleGroupIds: string[]): Promise<void> => {
  await users().doc(id).update({ access, roleGroupIds });
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

const listByAccessState = async (state: AccessState): Promise<SanctuaryUser[]> => {
  const snap = await users().where('access.state', '==', state).orderBy('createdAt', 'asc').get();
  return snap.docs.map((doc) => withGroups(doc.data() as StoredUser));
};

const listAll = async (): Promise<SanctuaryUser[]> => {
  const snap = await users().orderBy('createdAt', 'asc').get();
  return snap.docs.map((doc) => withGroups(doc.data() as StoredUser));
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
  saveAccess,
  setGroups,
  bumpSessionVersion,
  listByAccessState,
  listAll,
  removeGroup,
};

export { usersRepo };
export type { NewUserProfile, UserSummary };
