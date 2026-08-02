/* @layer renderer-components @kind logic */
/**
 * Auto-layout. The config is a diff, never a requirement: with no groups at all
 * the whole schema lays out as one unnamed set in schema order, which is the
 * only sensible default for a collection nobody has configured yet.
 *
 * With groups, each one is laid out in the order the config lists it, holding
 * the fields it claims in the order it names them. Anything left over lands in a
 * final implicit group rather than disappearing — a config that forgets a field
 * must not be able to hide it.
 */
import type { FieldDescriptor, FieldGroup, SchemaConfig } from '../../../data/schema/field-descriptor';
import type { EditorGroupModel } from '../RecordEditor.type';

const IMPLICIT_ID = 'all';
const LEFTOVER_ID = 'other';
const LEFTOVER_LABEL = 'Other';

/** A group claims a field by naming its path, or by the group id the schema already attached. */
const claims = (group: FieldGroup, field: FieldDescriptor): boolean =>
  group.paths.includes(field.path) || field.group === group.id;

/** Named paths lead, in config order; anything else keeps schema order behind them. */
const orderWithin = (
  fields: readonly FieldDescriptor[],
  paths: readonly string[],
): readonly FieldDescriptor[] =>
  [...fields]
    .map((field, index) => {
      const at = paths.indexOf(field.path);
      return { field, index, rank: at === -1 ? Number.MAX_SAFE_INTEGER : at };
    })
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map((entry) => entry.field);

const singleGroup = (fields: readonly FieldDescriptor[]): readonly EditorGroupModel[] =>
  (fields.length ? [{ id: IMPLICIT_ID, fields }] : []);

const layoutGroups = (
  schema: readonly FieldDescriptor[],
  config?: SchemaConfig,
): readonly EditorGroupModel[] => {
  const visible = schema.filter((field) => !field.hidden);
  const configured = config?.groups ?? [];
  if (!configured.length) return singleGroup(visible);

  const taken = new Set<string>();
  const laid: EditorGroupModel[] = [];
  for (const group of configured) {
    const fields = visible.filter((field) => claims(group, field));
    if (!fields.length) continue;
    for (const field of fields) taken.add(field.path);
    laid.push({ id: group.id, label: group.label, fields: orderWithin(fields, group.paths) });
  }
  // Every group matched nothing — treat it as the unconfigured case rather than
  // labelling the entire record "Other".
  if (!laid.length) return singleGroup(visible);

  const leftover = visible.filter((field) => !taken.has(field.path));
  if (leftover.length) laid.push({ id: LEFTOVER_ID, label: LEFTOVER_LABEL, fields: leftover });
  return laid;
};

export { LEFTOVER_ID, layoutGroups };
