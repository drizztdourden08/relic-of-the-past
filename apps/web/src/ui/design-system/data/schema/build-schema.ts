/* @layer renderer-components @kind logic */
/**
 * The schema Builder: derive from the data, then layer the config as a DIFF.
 * The config never removes what derivation found. It relabels, reorders,
 * hides, re-kinds and re-groups it. Anything the config does not mention keeps
 * exactly what the data said.
 */
import type { FieldDescriptor, SchemaConfig } from './field-descriptor';
import { deriveSchema } from './derive-fields';

interface SchemaIndex {
  byPath: (path: string) => FieldDescriptor | undefined;
  /** Every field, flattened depth-first. Array ELEMENT descriptors are excluded. */
  all: () => readonly FieldDescriptor[];
  /** The top-level fields, in their final order. */
  roots: () => readonly FieldDescriptor[];
}

/** Either form is accepted wherever a schema is asked for. */
type SchemaLike = SchemaIndex | readonly FieldDescriptor[];

const groupOf = (config: SchemaConfig | undefined): Record<string, string> => {
  const byPath: Record<string, string> = {};
  for (const group of config?.groups ?? []) {
    for (const path of group.paths) byPath[path] = group.id;
  }
  return byPath;
};

/** Listed paths lead, in config order; everything else keeps derived order behind them. */
const reorder = (
  fields: readonly FieldDescriptor[],
  order: readonly string[],
): readonly FieldDescriptor[] => {
  const rank = (field: FieldDescriptor): number => {
    const at = order.indexOf(field.path);
    return at === -1 ? Number.MAX_SAFE_INTEGER : at;
  };
  return [...fields]
    .map((field, index) => ({ field, index, rank: rank(field) }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map((entry) => entry.field);
};

const applyConfig = (
  fields: readonly FieldDescriptor[],
  config: SchemaConfig | undefined,
  groups: Record<string, string>,
): readonly FieldDescriptor[] => {
  const hidden = new Set(config?.hidden ?? []);
  const layered = fields.map((field) => {
    const next: FieldDescriptor = { ...field };
    const label = config?.labels?.[field.path];
    if (label !== undefined) next.label = label;
    const format = config?.formats?.[field.path];
    if (format !== undefined) next.format = format;
    if (hidden.has(field.path)) next.hidden = true;
    if (groups[field.path] !== undefined) next.group = groups[field.path];
    if (field.children) next.children = applyConfig(field.children, config, groups);
    return next;
  });
  return config?.order?.length ? reorder(layered, config.order) : layered;
};

const buildSchema = <T>(rows: readonly T[], config?: SchemaConfig): readonly FieldDescriptor[] => {
  const derived = deriveSchema(rows, { kinds: config?.kinds });
  return applyConfig(derived, config, groupOf(config));
};

const flatten = (fields: readonly FieldDescriptor[], into: FieldDescriptor[]): FieldDescriptor[] => {
  for (const field of fields) {
    into.push(field);
    if (field.children) flatten(field.children, into);
  }
  return into;
};

const createSchemaIndex = (fields: readonly FieldDescriptor[]): SchemaIndex => {
  const flat = flatten(fields, []);
  const map = new Map(flat.map((field) => [field.path, field]));
  return {
    byPath: (path) => map.get(path),
    all: () => flat,
    roots: () => fields,
  };
};

const isSchemaIndex = (schema: SchemaLike): schema is SchemaIndex =>
  !Array.isArray(schema) && typeof (schema as SchemaIndex).byPath === 'function';

/** Accepts a raw field list or an already-built index, so callers never have to care. */
const toSchemaIndex = (schema: SchemaLike): SchemaIndex =>
  isSchemaIndex(schema) ? schema : createSchemaIndex(schema);

export { buildSchema, createSchemaIndex, toSchemaIndex };
export type { SchemaIndex, SchemaLike };
