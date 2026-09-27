/* @layer shared-game @kind data */
import { recordsIn } from './registry';
import type { RegionRecord } from './types';

// One file per world and kind: the overworld regions, the cave and house interiors, and one
// file per dungeon for its interior wings.
const files = import.meta.glob('./records/regions/**/*.ts', { eager: true });

const REGIONS: RegionRecord[] = recordsIn<RegionRecord>(files);

export { REGIONS };
