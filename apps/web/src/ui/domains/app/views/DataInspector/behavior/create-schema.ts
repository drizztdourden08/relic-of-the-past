/* @layer renderer-app @kind logic */
import { IDENTITY_PATH } from '@ds/composites/RecordEditor';
import type { EntityKind } from '@shared/game/data';
import type { FieldDescriptor } from '@ds/data';
import { CREATE_ONLY_EXCLUDED } from '../DataInspector.constants';

const createSchemaFor = (kind: EntityKind, schema: readonly FieldDescriptor[]): readonly FieldDescriptor[] => {
  const excluded = new Set<string>([IDENTITY_PATH, ...(CREATE_ONLY_EXCLUDED[kind] ?? [])]);
  return schema.filter((field) => !excluded.has(field.path));
};

export { createSchemaFor };
