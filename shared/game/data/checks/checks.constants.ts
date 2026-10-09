/* @layer shared-game @kind constants */
import { recordsIn } from '../registry';
import type { CheckRecord } from '../types';
import { checkOfRow } from './check-of-row';
import type { EventRow } from './event-spec.type';

const files = import.meta.glob('../records/checks/**/*.ts', { eager: true });

const ALL_CHECKS: CheckRecord[] = recordsIn<EventRow>(files)
  .map(checkOfRow)
  .sort((a, b) => a.id.localeCompare(b.id));

export { ALL_CHECKS };
