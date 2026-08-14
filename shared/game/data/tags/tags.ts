/* @layer shared-game @kind data */
import { collectRecords } from '../collect-records';
import type { TagRecord } from '../types';

const files = import.meta.glob('../records/tags/tags.ts', { eager: true });

const ALL_TAGS: TagRecord[] = collectRecords<TagRecord>(files);

export { ALL_TAGS };
