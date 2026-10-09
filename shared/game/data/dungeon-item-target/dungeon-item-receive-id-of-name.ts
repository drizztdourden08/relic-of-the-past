/* @layer shared-game @kind logic */
import { findOne } from '../facade';
import { dungeonItemReceiveIdOfRecord } from './dungeon-item-receive-id-of-record';

const dungeonItemReceiveIdOfName = (standardItemName: string): number | undefined =>
  dungeonItemReceiveIdOfRecord(findOne('item', (item) => item.name === standardItemName));

export { dungeonItemReceiveIdOfName };
