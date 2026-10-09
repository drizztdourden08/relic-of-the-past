/* @layer shared-game @kind logic */
import type { ItemGroupRecord } from '../types';
import { ITEM_GROUP_SPEC } from './field-specs.constants';
import { recordLiteral } from './record-literal';

const serializeItemGroupRecord = (record: ItemGroupRecord): string => recordLiteral(record, ITEM_GROUP_SPEC);

export { serializeItemGroupRecord };
