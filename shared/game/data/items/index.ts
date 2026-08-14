/* @layer shared-game @kind data */
import { collectRecords } from '../collect-records';
import type { ItemRecord } from '../types';

// The record files are flat here, so they are globbed directly.
const files = import.meta.glob('../records/items/*.ts', { eager: true });

const ALL_ITEMS: ItemRecord[] = collectRecords<ItemRecord>(files);

export { ALL_ITEMS };
