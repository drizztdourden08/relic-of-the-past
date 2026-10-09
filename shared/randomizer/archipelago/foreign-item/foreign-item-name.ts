/* @layer shared-game @kind logic */
import { FOREIGN_ITEM_NAME } from './foreign-item.constants';

const foreignItemName = (owner?: string): string =>
  (owner === undefined || owner === '' ? FOREIGN_ITEM_NAME : `${owner}'s item`);

export { foreignItemName };
