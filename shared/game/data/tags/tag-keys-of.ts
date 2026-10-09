/* @layer shared-game @kind logic */
import { tagIndex } from './tag-index';

const tagKeysOf = (ids: readonly string[]): readonly string[] =>
  ids.map(id => tagIndex.byId.get(id)?.name).filter((key): key is string => key !== undefined);

export { tagKeysOf };
