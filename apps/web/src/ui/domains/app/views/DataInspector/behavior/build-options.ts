/* @layer renderer-app @kind logic */
import type { EntityKind } from '@shared/game/data';
import type { IdRefOption } from '@ds/composites/RecordEditor';
import { COLLECTION_SOURCES } from './collection-sources';
import { optionLabel } from './option-label';

const buildOptions = (kind: EntityKind): readonly IdRefOption[] => {
  const source = COLLECTION_SOURCES[kind];
  return source.rows.map(row => {
    const id = source.getId(row);
    return { value: id, label: optionLabel(id), description: id };
  });
};

export { buildOptions };
