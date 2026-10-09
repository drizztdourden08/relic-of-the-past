/* @layer tests @kind helper */
import { buildSchema } from '@drizztdourden08/tessera/data';
import type { FieldDescriptor } from '@drizztdourden08/tessera/data';

const fieldAt = (rows: readonly unknown[], path: string): FieldDescriptor => {
  const field = buildSchema(rows).find((entry) => entry.path === path);
  if (!field) throw new Error(`no field at ${path}`);
  return field;
};

export { fieldAt };
