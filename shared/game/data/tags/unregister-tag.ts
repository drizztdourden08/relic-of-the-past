/* @layer shared-game @kind logic */
import { replaceAll } from '../registry';
import { ALL_TAGS } from './tags.constants';
import { tagIndex } from './tag-index';

const unregisterTag = (id: string): boolean => {
  const existing = tagIndex.byId.get(id);
  if (!existing) return false;
  const index = ALL_TAGS.findIndex(tag => tag.id === id);
  if (index >= 0) ALL_TAGS.splice(index, 1);
  tagIndex.byId.delete(id);
  tagIndex.byKey.delete(existing.name);
  replaceAll('tag', ALL_TAGS);
  return true;
};

export { unregisterTag };
