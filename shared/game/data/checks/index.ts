/* @layer shared-game @kind data */
import { collectRecords } from '../collect-records';
import type { CheckRecord } from '../types';

// One entry per world, plus the dungeon set. Empty without vault access.
const groups = import.meta.glob('../records/checks/*/index.ts', { eager: true });

const ALL_CHECKS: CheckRecord[] = collectRecords<CheckRecord>(groups);

export { ALL_CHECKS };
