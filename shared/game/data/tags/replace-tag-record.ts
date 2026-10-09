/* @layer shared-game @kind logic */
import { replaceAll } from '../registry';
import type { TagRecord } from '../types';
import { ALL_TAGS } from './tags.constants';
import { tagIndex } from './tag-index';

const replaceTagRecord = (record: TagRecord): boolean => {
  const existing = tagIndex.byId.get(record.id);
  if (!existing) return false;
  const index = ALL_TAGS.findIndex(tag => tag.id === record.id);
  if (index === -1) return false;
  ALL_TAGS[index] = record;
  tagIndex.byId.set(record.id, record);
  if (existing.name !== record.name) tagIndex.byKey.delete(existing.name);
  tagIndex.byKey.set(record.name, record);
  replaceAll('tag', ALL_TAGS);
  return true;
};

export { replaceTagRecord };
