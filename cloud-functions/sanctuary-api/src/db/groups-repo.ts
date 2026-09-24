/* @layer root-config @kind logic */
/** Groups, oldest first. The default group is written by the first read that
 *  misses it, so a fresh project and an existing one reach the same state
 *  without a migration step. */
import { DEFAULT_GROUP_ID, FILE_TYPES } from '../../../../shared/sanctuary';
import type { Group } from '../../../../shared/sanctuary';
import { readEnv } from '../env';
import { collection, now } from './firestore';

type GroupPatch = Partial<Pick<Group, 'name' | 'discordRoleId' | 'rights'>>;

const groups = () => collection('groups');

const defaultGroup = (): Group => ({
  id: DEFAULT_GROUP_ID,
  name: 'Contributors',
  discordRoleId: readEnv().DISCORD_CONTRIBUTOR_ROLE_ID,
  rights: { fileTypes: [...FILE_TYPES], reports: true },
  createdAt: now(),
});

/** Creates the default group unless another request already did, then reads it back. */
const seedDefault = async (): Promise<Group> => {
  const ref = groups().doc(DEFAULT_GROUP_ID);
  await ref.create(defaultGroup()).catch(() => undefined);
  const snap = await ref.get();
  return snap.data() as Group;
};

const all = async (): Promise<Group[]> => {
  const snap = await groups().orderBy('createdAt', 'asc').get();
  const list = snap.docs.map((doc) => doc.data() as Group);
  if (list.some((group) => group.id === DEFAULT_GROUP_ID)) return list;
  return [await seedDefault(), ...list];
};

const get = async (id: string): Promise<Group | null> => {
  const snap = await groups().doc(id).get();
  return snap.exists ? (snap.data() as Group) : null;
};

/** Fails when the id is taken, so two creates of the same name cannot overwrite each other. */
const create = async (group: Group): Promise<void> => {
  await groups().doc(group.id).create(group);
};

const update = async (id: string, patch: GroupPatch): Promise<void> => {
  await groups().doc(id).update(patch);
};

const remove = async (id: string): Promise<void> => {
  await groups().doc(id).delete();
};

const groupsRepo = { all, get, create, update, remove };

export { groupsRepo };
export type { GroupPatch };
