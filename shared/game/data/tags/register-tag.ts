/* @layer shared-game @kind logic */
import { replaceAll } from '../registry';
import type { TagRecord } from '../types';
import { ALL_TAGS } from './tags.constants';
import { tagIndex } from './tag-index';

const registerTag = (record: TagRecord): boolean => {
  if (tagIndex.byId.has(record.id) || tagIndex.byKey.has(record.name)) return false;
  ALL_TAGS.push(record);
  tagIndex.byId.set(record.id, record);
  tagIndex.byKey.set(record.name, record);
  replaceAll('tag', ALL_TAGS);
  return true;
};

export { registerTag };
