/* @layer shared-game @kind data */
import { collectRecords } from './collect-records';
import type { LocationRecord } from './types';

const files = import.meta.glob('./records/locations.ts', { eager: true });

const LOCATIONS: LocationRecord[] = collectRecords<LocationRecord>(files);

export { LOCATIONS };
