/* @layer shared-game @kind logic */
import type { EnumerationEntry } from '../types';
import { ENUMERATION_SPEC } from './field-specs.constants';
import { recordLiteral } from './record-literal';

const serializeEnumerationRecord = (record: EnumerationEntry): string => recordLiteral(record, ENUMERATION_SPEC);

export { serializeEnumerationRecord };
