/* @layer tests @kind helper */
import { buildSchema } from '../../../apps/web/src/ui/design-system/data/schema/build-schema';
import type { FieldDescriptor } from '../../../apps/web/src/ui/design-system/data/schema/field-descriptor';

const fieldAt = (rows: readonly unknown[], path: string): FieldDescriptor => {
  const field = buildSchema(rows).find((entry) => entry.path === path);
  if (!field) throw new Error(`no field at ${path}`);
  return field;
};

export { fieldAt };
