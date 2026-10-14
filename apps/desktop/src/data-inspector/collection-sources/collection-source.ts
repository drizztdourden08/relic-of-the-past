/* @layer renderer-app @kind logic */
import type { EntityKind } from '@rotp/game-data';
import type { InspectorSource } from '@app/views/DataInspector/DataInspector.type';
import { builtSources } from './built-sources';
import { sourceFor } from './source-for';

const collectionSource = (kind: EntityKind): InspectorSource => {
  const ready = builtSources.get(kind);
  if (ready) return ready;
  const source = sourceFor(kind);
  builtSources.set(kind, source);
  return source;
};

export { collectionSource };
