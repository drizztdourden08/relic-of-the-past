/* @layer shared-game @kind constants */
import { recordsIn } from '../registry';
import type { LocationRecord } from '../types';

const files = import.meta.glob('../records/locations/*.ts', { eager: true });

const LOCATIONS: LocationRecord[] = recordsIn<LocationRecord>(files);

export { LOCATIONS };
