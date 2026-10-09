/* @layer renderer-app @kind logic */
import type { TagCreator } from '@ds/composites/RecordEditor';
import { createTagFor } from './create-tag-for';
import { tagCreators } from './tag-creators';

const tagCreatorFor = (collectionKind: string): TagCreator => {
  const held = tagCreators.get(collectionKind);
  if (held) return held;
  const built: TagCreator = key => createTagFor(collectionKind, key);
  tagCreators.set(collectionKind, built);
  return built;
};

export { tagCreatorFor };
