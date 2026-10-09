/* @layer shared-game @kind logic */
import type { TagRecord } from '../types';
import { TAG_SPEC } from './field-specs.constants';
import { recordLiteral } from './record-literal';

const serializeTagRecord = (record: TagRecord): string => recordLiteral(record, TAG_SPEC);

export { serializeTagRecord };
