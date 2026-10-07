/* @layer shared-game @kind data */
import { recordsIn } from './registry';
import type { DungeonRecord } from './types';

// One file per dungeon, under its world.
const files = import.meta.glob('./records/dungeons/**/*.ts', { eager: true });

const DUNGEONS: DungeonRecord[] = recordsIn<DungeonRecord>(files);

export { DUNGEONS };
