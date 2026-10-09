/* @layer shared-game @kind constants */
import { recordsIn } from '../registry';
import type { RegionRecord } from '../types';

const files = import.meta.glob('../records/regions/**/*.ts', { eager: true });

const REGIONS: RegionRecord[] = recordsIn<RegionRecord>(files);

export { REGIONS };
