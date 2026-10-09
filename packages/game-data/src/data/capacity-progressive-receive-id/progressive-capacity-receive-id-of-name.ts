/* @layer shared-game @kind logic */
import { progressiveCapacityFamilyOf } from '../capacity-progressive-item';
import { progressiveCapacityReceiveIdOf } from './progressive-capacity-receive-id-of';

const progressiveCapacityReceiveIdOfName = (standardItemName: string): number | undefined => {
  const family = progressiveCapacityFamilyOf(standardItemName);
  return family === undefined ? undefined : progressiveCapacityReceiveIdOf(family);
};

export { progressiveCapacityReceiveIdOfName };
