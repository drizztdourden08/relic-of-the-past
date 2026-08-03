/* @layer renderer-components @kind logic */
/**
 * "Show me the name, not the id" — expressed as the two things this package
 * cannot work out for itself, plus the one rule that it can.
 *
 * A reference column knows an id and the collection it points at, and that is
 * where the design system stops: which fields that collection HAS, and what any
 * one of its records holds, are facts about a dataset. So both arrive injected,
 * exactly as the editor's option lookup does — one to fill the "Display as…"
 * submenu, one to answer a single cell. Given neither, every cell reads as it
 * always has, which is what keeps the table usable with nothing wired to it.
 *
 * The rule that IS local: substitution is cosmetic and per column. It never
 * touches the value the cell carries, so a cell reading as the referenced
 * record's name still holds that record's id, and following it is unchanged.
 *
 * A THIRD thing this package cannot work out for itself, added alongside the
 * two above: the sensible name to show when a column has not been told to
 * show one at all. That is still a domain fact — which collection an id
 * belongs to, and what that collection calls its records — so it arrives the
 * same way, as `resolveDefault`. It only ever runs when `displayField` is
 * unset, so a column that already opts into a specific field keeps reading
 * exactly that field, unchanged.
 */
import type { FieldDescriptor } from '../../../data/schema/field-descriptor';

/** One choosable field of the collection a reference points at. */
interface IdRefTargetField {
  path: string;
  label: string;
}

/** What the target collection offers as a display field — for the ⋯ submenu. */
type IdRefTargetFieldResolver = (targetKind: string) => readonly IdRefTargetField[];

/**
 * One referenced record's value at one path, as text. `undefined` for anything
 * the caller cannot answer for, which puts the id back rather than blanking the
 * cell — a reference that resolves to nothing must still be readable.
 */
type IdRefDisplayResolver = (
  targetKind: string,
  id: string,
  displayField: string,
) => string | undefined;

/**
 * The baseline name for an id with no column-level choice behind it at all.
 * `targetKind` is a hint, not a requirement: a column whose rows point at
 * different collections (the Recommendations table's `targetId`, mixed by
 * design) has none, so the resolver falls back to reading it off the id
 * itself, per call — see `defaultIdRefDisplay`.
 */
type IdRefDefaultResolver = (id: string, targetKind?: string) => string | undefined;

/** A column's display choice paired with whoever can answer it. */
interface DisplaySubstitution {
  /** A path in the TARGET collection's schema; absent means show the id. */
  displayField?: string;
  resolve?: IdRefDisplayResolver;
  resolveDefault?: IdRefDefaultResolver;
}

const asId = (value: unknown): string => {
  if (value === undefined || value === null) return '';
  return typeof value === 'string' ? value.trim() : String(value).trim();
};

/**
 * The text to show in place of a reference's id, or `undefined` for "show the
 * id". A configured `displayField` (with a `resolve` to answer it) wins when
 * present, unchanged from before this had a fallback; with none configured,
 * `resolveDefault` gets a turn — the new baseline every reference gets rather
 * than only the columns a schema config happened to opt in. Every missing
 * piece still falls through to the plain id, so a half-wired table degrades
 * exactly as it always has.
 */
const substituteDisplay = (
  value: unknown,
  field: FieldDescriptor,
  substitution?: DisplaySubstitution,
): string | undefined => {
  if (field.kind !== 'idRef') return undefined;
  const id = asId(value);
  if (!id) return undefined;
  const { displayField, resolve, resolveDefault } = substitution ?? {};
  if (displayField && resolve && field.targetKind) return resolve(field.targetKind, id, displayField);
  return resolveDefault?.(id, field.targetKind);
};

export { substituteDisplay };
export type {
  DisplaySubstitution, IdRefDefaultResolver, IdRefDisplayResolver, IdRefTargetField, IdRefTargetFieldResolver,
};
