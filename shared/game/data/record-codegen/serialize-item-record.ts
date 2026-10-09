/* @layer shared-game @kind logic */
import type { ItemRecord } from '../types';
import { ITEM_SPEC } from './field-specs.constants';
import { recordLiteral } from './record-literal';

const serializeItemRecord = (record: ItemRecord): string => recordLiteral(record, ITEM_SPEC);

export { serializeItemRecord };
