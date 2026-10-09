/* @layer shared-game @kind logic */
import { FAMILY_BY_ITEM } from './dungeon-item-modes.constants';
import type { ItemKey } from '../../item-ids.data';
import type { DungeonItemFamily } from '../dungeon-item.type';

const familyOfDungeonItem = (item: ItemKey): DungeonItemFamily | undefined => FAMILY_BY_ITEM.get(item);

export { familyOfDungeonItem };
