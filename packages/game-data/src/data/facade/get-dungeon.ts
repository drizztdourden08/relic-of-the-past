/* @layer shared-game @kind logic */
import { get } from '../registry';
import type { DungeonRecord } from '../types';
import { noRecord } from './no-record';

const getDungeon = (id: string): DungeonRecord => get('dungeon', id) ?? noRecord('dungeon', id);

export { getDungeon };
