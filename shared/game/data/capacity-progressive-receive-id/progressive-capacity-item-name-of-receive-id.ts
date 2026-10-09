/* @layer shared-game @kind logic */
import { progressiveCapacityItemName } from '../capacity-progressive-item';
import { progressiveCapacityFamilyOfReceiveId } from './progressive-capacity-family-of-receive-id';

const progressiveCapacityItemNameOfReceiveId = (id: number): string | undefined => {
  const family = progressiveCapacityFamilyOfReceiveId(id);
  return family === undefined ? undefined : progressiveCapacityItemName(family);
};

export { progressiveCapacityItemNameOfReceiveId };
