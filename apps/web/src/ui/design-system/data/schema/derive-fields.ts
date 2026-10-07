/* @layer renderer-components @kind logic */
/**
 * Derivation half of the schema Builder: walk every row and describe what is
 * there. Objects recurse through their own keys, arrays through their
 * elements. Nothing here reads the config except forced kinds, which must be
 * honoured DURING the walk, so a path forced to `string` does not then have its
 * children derived as if it were an object.
 */
import type { FieldDescriptor, FieldKind } from './field-descriptor';
import { enumOptions, idTargetKind, inferKind, isPlainObject } from './infer-kind';

/** Guards against pathological nesting and against cyclic references. */
const MAX_DEPTH = 8;

interface DeriveContext {
  kinds?: Record<string, FieldKind>;
}

/** `roomIndex` reads as `Room index`: generic humanisation, no domain knowledge. */
const labelFor = (segment: string): string => {
  const spaced = segment.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

const keysInOrder = (samples: readonly unknown[]): readonly string[] => {
  const keys = new Set<string>();
  for (const sample of samples) {
    if (isPlainObject(sample)) for (const key of Object.keys(sample)) keys.add(key);
  }
  return [...keys];
};

const childPath = (prefix: string, key: string): string => (prefix ? `${prefix}.${key}` : key);

const describe = (
  path: string,
  label: string,
  values: readonly unknown[],
  optional: boolean,
  ctx: DeriveContext,
  depth: number,
): FieldDescriptor => {
  const kind = ctx.kinds?.[path] ?? inferKind(values);
  const field: FieldDescriptor = { path, label, kind, optional };
  if (kind === 'enum') field.options = enumOptions(values);
  if (kind === 'idRef') field.targetKind = idTargetKind(values);
  if (depth >= MAX_DEPTH) return field;
  if (kind === 'array') {
    const elements = values.flatMap((v) => (Array.isArray(v) ? (v as unknown[]) : []));
    field.of = describe(`${path}[]`, `${label} item`, elements, false, ctx, depth + 1);
  }
  if (kind === 'object' || kind === 'union') {
    field.children = deriveFields(values.filter(isPlainObject), path, ctx, depth + 1);
  }
  return field;
};

const deriveFields = (
  samples: readonly unknown[],
  prefix: string,
  ctx: DeriveContext,
  depth: number,
): readonly FieldDescriptor[] =>
  keysInOrder(samples).map((key) => {
    const values = samples.map((s) => (isPlainObject(s) ? s[key] : undefined));
    const optional = values.some((v) => v === undefined);
    return describe(childPath(prefix, key), labelFor(key), values, optional, ctx, depth);
  });

const deriveSchema = (rows: readonly unknown[], ctx: DeriveContext): readonly FieldDescriptor[] =>
  deriveFields(rows, '', ctx, 0);

export { MAX_DEPTH, deriveSchema, labelFor };
export type { DeriveContext };
