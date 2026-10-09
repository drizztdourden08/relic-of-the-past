/* @layer shared-game @kind logic */
import type { DungeonRecord } from '../types';
import { DUNGEON_SPEC } from './field-specs.constants';
import { recordLiteral } from './record-literal';

const serializeDungeonRecord = (record: DungeonRecord): string => recordLiteral(record, DUNGEON_SPEC);

export { serializeDungeonRecord };
