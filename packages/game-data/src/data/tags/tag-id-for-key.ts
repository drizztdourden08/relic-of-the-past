/* @layer shared-game @kind logic */
import type { TagId } from '../types';
import { tagIndex } from './tag-index';

const tagIdForKey = (key: string): TagId | undefined => tagIndex.byKey.get(key)?.id;

export { tagIdForKey };
