/* @layer shared-game @kind data */
import { recordsIn } from './registry';
import type { AreaRecord } from './types';

const files = import.meta.glob('./records/areas/*.ts', { eager: true });

const AREAS: AreaRecord[] = recordsIn<AreaRecord>(files);

export { AREAS };
