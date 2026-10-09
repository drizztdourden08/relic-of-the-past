/* @layer shared-game @kind constants */
import { recordsIn } from '../registry';
import type { TagRecord } from '../types';

const files = import.meta.glob('../records/tags/tags.ts', { eager: true });

const ALL_TAGS: TagRecord[] = recordsIn<TagRecord>(files);

const SEPARATOR = ':';

export { ALL_TAGS, SEPARATOR };
