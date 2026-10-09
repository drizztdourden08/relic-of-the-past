/* @layer renderer-app @kind logic */
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
