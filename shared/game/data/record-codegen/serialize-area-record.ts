/* @layer shared-game @kind logic */
import type { AreaRecord } from '../types';
import { AREA_SPEC } from './field-specs.constants';
import { recordLiteral } from './record-literal';

const serializeAreaRecord = (record: AreaRecord): string => recordLiteral(record, AREA_SPEC);

export { serializeAreaRecord };
