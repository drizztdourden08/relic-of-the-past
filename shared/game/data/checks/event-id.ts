/* @layer shared-game @kind logic */
import type { CheckId } from '../types';
import { EVENT_ID_BASE } from './event-id.constants';

const eventId = (n: number): CheckId => `check-${String(EVENT_ID_BASE + n).padStart(3, '0')}` as CheckId;

export { eventId };
