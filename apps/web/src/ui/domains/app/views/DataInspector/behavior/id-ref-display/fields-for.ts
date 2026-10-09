/* @layer renderer-app @kind logic */
import { buildSchema } from '@ds/data';
import type { EntityKind } from '@shared/game/data';
import type { IdRefTargetField } from '@ds/composites/DataTable';
import { COLLECTION_SOURCES } from '../collection-sources';
import { collectLeaves } from './collect-leaves';
import { fieldCache } from './field-cache';

const fieldsFor = (kind: EntityKind): readonly IdRefTargetField[] => {
  const held = fieldCache.get(kind);
  if (held) return held;
  const source = COLLECTION_SOURCES[kind];
  const built = collectLeaves(buildSchema(source.rows, source.config), []);
  fieldCache.set(kind, built);
  return built;
};

export { fieldsFor };
