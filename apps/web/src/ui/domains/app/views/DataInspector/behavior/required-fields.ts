/* @layer renderer-app @kind logic */
/**
 * Which paths a record must hold a value on before it can be created.
 *
 * A field counts as required exactly when the schema itself says so —
 * `FieldDescriptor.optional` is already exact rather than a guess, because
 * derivation samples every row in the collection (see infer-kind.ts). Nesting
 * is only followed through plain objects: an array or a union's own
 * completeness is a fact about its VALUE (which branch, how many entries),
 * not a fixed shape the schema can name in advance, so neither is walked any
 * further than its own top path.
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
