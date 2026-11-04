/* @layer shared-game @kind logic */
import { itemAt } from '@drizztdourden08/brock-core/util';

const addAt = (list: number[], index: number, delta: number): void => {
  list[index] = itemAt(list, index) + delta;
};

export { addAt };
