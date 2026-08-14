/* @layer shared-game @kind data */
import { collectRecords } from '../collect-records';
import type { ActorRecord } from '../types';

// The record files are flat here, so they are globbed directly.
const files = import.meta.glob('../records/actors/*.ts', { eager: true });

const ALL_ACTORS: ActorRecord[] = collectRecords<ActorRecord>(files);

export { ALL_ACTORS };
