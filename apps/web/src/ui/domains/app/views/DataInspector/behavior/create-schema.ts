/* @layer renderer-app @kind logic */
/**
 * The schema a create dialog actually offers, per collection.
 *
 * The id is never one of them — it comes back allocated, on every collection
 * alike. A handful of collections also derive a field their `Allocate*` write
 * path has nowhere to put: a tag's `name` is computed from its namespace and
 * value rather than entered (`allocateTag` takes the combined key), and an
 * area/location's `vanillaName` has no slot in `AllocateGeographyArgs`. Every
 * other collection's create channel takes the whole record (minus id), so
 * nothing else needs trimming.
 *
 * These are dropped entirely rather than merely hidden: a dropped field is
 * never seeded by `blankRecordFor` either, so the draft that reaches the wire
 * never carries a stray value for something the write path cannot accept —
 * carrying even a blank `id` through would let it collide with the one the
 * allocator mints.
 */
import { IDENTITY_PATH } from '@ds/composites/RecordEditor';
import type { EntityKind } from '@shared/game/data';
import type { FieldDescriptor } from '@ds/data';

const CREATE_ONLY_EXCLUDED: Partial<Record<EntityKind, readonly string[]>> = {
  tag: ['name'],
  area: ['vanillaName'],
  location: ['vanillaName'],
};

const createSchemaFor = (kind: EntityKind, schema: readonly FieldDescriptor[]): readonly FieldDescriptor[] => {
  const excluded = new Set<string>([IDENTITY_PATH, ...(CREATE_ONLY_EXCLUDED[kind] ?? [])]);
  return schema.filter((field) => !excluded.has(field.path));
};

export { createSchemaFor };
