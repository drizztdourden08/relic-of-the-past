/* @layer shared-game @kind logic */
import type { CheckRecord } from '../types';
import { eventRecord } from '../records/checks/events/event-record';
import type { EventRow } from './event-spec.type';

const checkOfRow = (row: EventRow): CheckRecord => ('n' in row ? eventRecord(row) : row);

export { checkOfRow };
