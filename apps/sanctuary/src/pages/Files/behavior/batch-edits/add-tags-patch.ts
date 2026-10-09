/* @layer sanctuary-site @kind logic */
import type { PatchOf } from './batch-edits.type';

const addTagsPatch = (tags: readonly string[]): PatchOf => (file) => {
  const added = tags.filter((tag) => !file.tags.includes(tag));
  return added.length === 0 ? null : { tags: [...file.tags, ...added] };
};

export { addTagsPatch };
