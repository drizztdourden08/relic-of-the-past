/* @layer shared-game @kind constants */
import type { CheckId } from '@shared/game/data/types/ids';

const BUNNY_ACCESSIBLE_LOCATIONS: ReadonlySet<CheckId> = new Set<CheckId>([
  'check-017',
  'check-033',
  'check-041',
  'check-043',
  'check-044',
  'check-047',
  'check-056',
  'check-061',
  'check-076',
  'check-088',
  'check-271',
  'check-272',
  'check-337',
  'check-071',
  'check-080',
  'check-070',
  'check-010',
  'check-039',
  'check-336',
  'check-072',
  'check-007',
  'check-009',
  'check-059',
]);

export { BUNNY_ACCESSIBLE_LOCATIONS };
