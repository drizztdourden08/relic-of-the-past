/* @layer shared-game @kind constants */
import { recordsIn } from '../registry';
import type { DungeonRecord } from '../types';

const files = import.meta.glob('../records/dungeons/**/*.ts', { eager: true });

const DUNGEONS: DungeonRecord[] = recordsIn<DungeonRecord>(files);

export { DUNGEONS };
