/* @layer shared-game @kind logic */
import type { CheckRecord } from '../types';
import { CHECK_SPEC } from './field-specs.constants';
import { recordLiteral } from './record-literal';

const serializeCheckRecord = (record: CheckRecord): string => recordLiteral(record, CHECK_SPEC);

export { serializeCheckRecord };
