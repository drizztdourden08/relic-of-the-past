/* @layer shared-game @kind logic */
import { getDungeon } from '../../../data';
import { dungeonForGroup } from './dungeon-for-group';

const dungeonGroupName = (group: number): string => {
  const id = dungeonForGroup(group);
  return id ? getDungeon(id).name : `group ${group}`;
};

export { dungeonGroupName };
