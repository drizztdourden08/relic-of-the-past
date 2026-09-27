/* @layer shared-game @kind data */
import { recordsIn } from '../registry';
import type { ItemRecord } from '../types';

// The files by meaning, plus one folder per dungeon for a dungeon's own items.
const files = import.meta.glob('../records/items/**/*.ts', { eager: true });

const ALL_ITEMS: ItemRecord[] = recordsIn<ItemRecord>(files);

export { ALL_ITEMS };
