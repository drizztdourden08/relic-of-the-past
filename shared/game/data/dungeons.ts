/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts; further split by size into dungeons-1.ts / dungeons-2.ts. */
import type { DungeonRecord } from './types';
import { DUNGEONS_1 } from './dungeons-1';
import { DUNGEONS_2 } from './dungeons-2';

const DUNGEONS: DungeonRecord[] = [...DUNGEONS_1, ...DUNGEONS_2];

export { DUNGEONS };
