/* @layer renderer-app @kind logic */
import type { EntityKind } from '@rotp/game-data';
import type { IdRefOption } from '@drizztdourden08/tessera/composites';
import { COLLECTION_SOURCES } from '@app/data-inspector/collection-sources';
import { optionLabel } from './option-label';

const buildOptions = (kind: EntityKind): readonly IdRefOption[] => {
  const source = COLLECTION_SOURCES[kind];
  return source.rows.map(row => {
    const id = source.getId(row);
    return { value: id, label: optionLabel(id), description: id };
  });
};

export { buildOptions };
