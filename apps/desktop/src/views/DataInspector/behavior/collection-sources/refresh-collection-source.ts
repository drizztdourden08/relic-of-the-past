/* @layer renderer-app @kind logic */
import type { EntityKind } from '@rotp/game-data';
import { builtSources } from './built-sources';

const refreshCollectionSource = (kind: EntityKind): void => {
  builtSources.delete(kind);
};

export { refreshCollectionSource };
