/* @layer shared-game @kind logic */
import type { TagId } from '../types';
import { tagIndex } from './tag-index';

const tagIdsForKeys = (keys: readonly string[]): readonly TagId[] =>
  keys.map(key => tagIndex.byKey.get(key)?.id).filter((id): id is TagId => id !== undefined);

export { tagIdsForKeys };
