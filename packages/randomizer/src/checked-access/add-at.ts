/* @layer shared-game @kind logic */
import { itemAt } from './item-at';

const addAt = (list: number[], index: number, delta: number): void => {
  list[index] = itemAt(list, index) + delta;
};

export { addAt };
