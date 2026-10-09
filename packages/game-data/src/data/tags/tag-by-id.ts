/* @layer shared-game @kind logic */
import type { TagRecord } from '../types';
import { tagIndex } from './tag-index';

const tagById = (id: string): TagRecord | undefined => tagIndex.byId.get(id);

export { tagById };
