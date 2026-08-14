/* @layer shared-game @kind data */
import { collectRecords } from './collect-records';
import type { DungeonRecord } from './types';

// Split by size into dungeons-1.ts / dungeons-2.ts. Empty without vault access.
const files = import.meta.glob('./records/dungeons-*.ts', { eager: true });

const DUNGEONS: DungeonRecord[] = collectRecords<DungeonRecord>(files);

export { DUNGEONS };
