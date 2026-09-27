/* @layer shared-game @kind data */
import { recordsIn } from '../registry';
import type { TagRecord } from '../types';

const files = import.meta.glob('../records/tags/tags.ts', { eager: true });

const ALL_TAGS: TagRecord[] = recordsIn<TagRecord>(files);

export { ALL_TAGS };
