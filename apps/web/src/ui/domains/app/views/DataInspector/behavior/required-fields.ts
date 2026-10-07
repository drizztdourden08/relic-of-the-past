/* @layer renderer-app @kind logic */
/**
 * Which paths a record must hold before it can be created. `optional` is exact
 * because derivation samples every row (see infer-kind.ts). Only plain objects
 * are walked: an array's or union's completeness depends on its value, not a
 * shape the schema can name in advance.
 */
import type { FieldDescriptor } from '@ds/data';

const collectRequired = (fields: readonly FieldDescriptor[], out: string[]): void => {
  for (const field of fields) {
    if (field.optional || field.hidden) continue;
    out.push(field.path);
    if (field.kind === 'object' && field.children?.length) collectRequired(field.children, out);
  }
};

const requiredPaths = (schema: readonly FieldDescriptor[]): readonly string[] => {
  const out: string[] = [];
  collectRequired(schema, out);
  return out;
};

export { requiredPaths };
