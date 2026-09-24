/* @layer root-config @kind logic */
import type { AccessState, SanctuaryUser } from '../../../../shared/sanctuary';
import { collection, now } from './firestore';

type NewUserProfile = { handle: string; avatarUrl: string | null };
type UserSummary = { userId: string; displayName: string };

const users = () => collection('users');

const create = async ({ handle, avatarUrl }: NewUserProfile): Promise<SanctuaryUser> => {
  const ref = users().doc();
  const user: SanctuaryUser = {
    id: ref.id,
    displayName: handle,
    avatarUrl,
    access: { state: 'pending', source: 'none', checkedAt: now() },
    sessionVersion: 1,
    createdAt: now(),
  };
  await ref.set(user);
  return user;
};

const get = async (id: string): Promise<SanctuaryUser | null> => {
  const snap = await users().doc(id).get();
  return snap.exists ? (snap.data() as SanctuaryUser) : null;
};

const summary = async (id: string): Promise<UserSummary> => {
  const user = await get(id);
  return { userId: id, displayName: user?.displayName ?? 'unknown' };
};

const setAccess = async (id: string, access: SanctuaryUser['access']): Promise<void> => {
  await users().doc(id).update({ access });
};

const bumpSessionVersion = async (id: string): Promise<number> => {
  const user = await get(id);
  const sessionVersion = (user?.sessionVersion ?? 0) + 1;
  await users().doc(id).update({ sessionVersion });
  return sessionVersion;
};

const listByAccessState = async (state: AccessState): Promise<SanctuaryUser[]> => {
  const snap = await users().where('access.state', '==', state).orderBy('createdAt', 'asc').get();
  return snap.docs.map((doc) => doc.data() as SanctuaryUser);
};

const listAll = async (): Promise<SanctuaryUser[]> => {
  const snap = await users().orderBy('createdAt', 'asc').get();
  return snap.docs.map((doc) => doc.data() as SanctuaryUser);
};

const usersRepo = { create, get, summary, setAccess, bumpSessionVersion, listByAccessState, listAll };

export { usersRepo };
export type { NewUserProfile, UserSummary };
