/* @layer shared-game @kind logic */
import { tagIndex } from './tag-index';

const hasTagKey = (ids: readonly string[], key: string): boolean => {
  const id = tagIndex.byKey.get(key)?.id;
  return id !== undefined && ids.includes(id);
};

export { hasTagKey };
