/* @layer hub-core @kind logic */
import { DEFAULT_GROUP_ID } from '@rotp/hub-contracts';
import type { Group } from '@rotp/hub-contracts';
import { readHubEnv } from '../env';
import type { DefaultGroupSeed } from '../site-config.type';
import { collection, now } from './firestore';
import type { GroupPatch } from './groups-repo.type';

const groups = () => collection('groups');

const defaultGroup = (seed: DefaultGroupSeed): Group => ({
  id: DEFAULT_GROUP_ID,
  name: seed.name,
  discordRoleId: readHubEnv().DISCORD_CONTRIBUTOR_ROLE_ID,
  rights: seed.rights,
  createdAt: now(),
});

const ignoreLostCreateRace = (): undefined => undefined;

const seedDefault = async (seed: DefaultGroupSeed): Promise<Group> => {
  const ref = groups().doc(DEFAULT_GROUP_ID);
  await ref.create(defaultGroup(seed)).catch(ignoreLostCreateRace);
  const snap = await ref.get();
  return snap.data() as Group;
};

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
