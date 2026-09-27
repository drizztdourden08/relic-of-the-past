/* @layer renderer-app @kind logic */
/**
 * The schema a create dialog offers, per collection. The id is allocated, never
 * entered, and a tag's `name` is computed from namespace and value
 * (`allocateTag` takes the combined key). Dropped, not hidden, so
 * `blankRecordFor` never seeds them and a blank `id` cannot collide with the
 * allocated one.
 */
import { IDENTITY_PATH } from '@ds/composites/RecordEditor';
import type { EntityKind } from '@shared/game/data';
import type { FieldDescriptor } from '@ds/data';

const CREATE_ONLY_EXCLUDED: Partial<Record<EntityKind, readonly string[]>> = {
  tag: ['name'],
};

const createSchemaFor = (kind: EntityKind, schema: readonly FieldDescriptor[]): readonly FieldDescriptor[] => {
  const excluded = new Set<string>([IDENTITY_PATH, ...(CREATE_ONLY_EXCLUDED[kind] ?? [])]);
  return schema.filter((field) => !excluded.has(field.path));
};

export { createSchemaFor };
