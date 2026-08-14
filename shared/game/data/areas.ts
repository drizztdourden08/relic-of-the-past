/* @layer shared-game @kind data */
import { collectRecords } from './collect-records';
import type { AreaRecord } from './types';

const files = import.meta.glob('./records/areas.ts', { eager: true });

const AREAS: AreaRecord[] = collectRecords<AreaRecord>(files);

export { AREAS };
