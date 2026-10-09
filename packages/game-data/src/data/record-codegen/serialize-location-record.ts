/* @layer shared-game @kind logic */
import type { LocationRecord } from '../types';
import { LOCATION_SPEC } from './field-specs.constants';
import { recordLiteral } from './record-literal';

const serializeLocationRecord = (record: LocationRecord): string => recordLiteral(record, LOCATION_SPEC);

export { serializeLocationRecord };
