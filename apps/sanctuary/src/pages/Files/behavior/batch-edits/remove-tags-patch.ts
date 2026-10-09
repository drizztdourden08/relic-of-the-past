/* @layer sanctuary-site @kind logic */
import type { PatchOf } from './batch-edits.type';

const removeTagsPatch = (tags: readonly string[]): PatchOf => (file) => {
  const kept = file.tags.filter((tag) => !tags.includes(tag));
  return kept.length === file.tags.length ? null : { tags: kept };
};

export { removeTagsPatch };
