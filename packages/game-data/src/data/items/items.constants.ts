/* @layer shared-game @kind constants */
import { recordsIn } from '../registry';
import type { ItemRecord } from '../types';

const files = import.meta.glob('../records/items/**/*.ts', { eager: true });

const ALL_ITEMS: ItemRecord[] = recordsIn<ItemRecord>(files);

export { ALL_ITEMS };
