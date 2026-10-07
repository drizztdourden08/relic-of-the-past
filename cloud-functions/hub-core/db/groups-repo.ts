/* @layer hub-core @kind logic */
/** Groups, oldest first. The default group is written by the first read that misses it,
 *  with the rights the site that owns it seeds, so a fresh project and an existing one
 *  reach the same state without a migration step. */
import { DEFAULT_GROUP_ID } from '../../../shared/hub';
import type { Group } from '../../../shared/hub';
import { readHubEnv } from '../env';
import type { DefaultGroupSeed } from '../site-config.type';
import { collection, now } from './firestore';

type GroupPatch = Partial<Pick<Group, 'name' | 'discordRoleId' | 'rights'>>;

const groups = () => collection('groups');

const defaultGroup = (seed: DefaultGroupSeed): Group => ({
  id: DEFAULT_GROUP_ID,
  name: seed.name,
  discordRoleId: readHubEnv().DISCORD_CONTRIBUTOR_ROLE_ID,
  rights: seed.rights,
  createdAt: now(),
});

/** Creates the default group unless another request already did, then reads it back. */
const seedDefault = async (seed: DefaultGroupSeed): Promise<Group> => {
  const ref = groups().doc(DEFAULT_GROUP_ID);
  await ref.create(defaultGroup(seed)).catch(() => undefined);
  const snap = await ref.get();
  return snap.data() as Group;
};

/** Every group; seeds the default one when `seed` is given and the group is missing. */
const all = async (seed: DefaultGroupSeed | null): Promise<Group[]> => {
  const snap = await groups().orderBy('createdAt', 'asc').get();
  const list = snap.docs.map((doc) => doc.data() as Group);
  if (!seed || list.some((group) => group.id === DEFAULT_GROUP_ID)) return list;
  return [await seedDefault(seed), ...list];
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
