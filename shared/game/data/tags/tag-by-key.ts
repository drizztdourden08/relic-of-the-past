/* @layer shared-game @kind logic */
import type { TagRecord } from '../types';
import { tagIndex } from './tag-index';

const tagByKey = (key: string): TagRecord | undefined => tagIndex.byKey.get(key);

export { tagByKey };
