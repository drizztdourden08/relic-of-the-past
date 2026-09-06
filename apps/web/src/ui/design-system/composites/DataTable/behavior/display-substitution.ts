/* @layer renderer-components @kind logic */
/**
 * Which fields a target collection has, what a record holds, and the default
 * name for an id are dataset facts, so all three arrive injected. Substitution
 * is cosmetic and per column: the cell still carries the id.
 */
import { isIdentityField } from '../../RecordEditor';
import type { FieldDescriptor } from '../../../data/schema/field-descriptor';

/** One choosable field of the collection a reference points at. */
interface IdRefTargetField {
  path: string;
  label: string;
}

/** Display fields the target collection offers, listed in the ⋯ submenu. */
type IdRefTargetFieldResolver = (targetKind: string) => readonly IdRefTargetField[];

/** One referenced record's value at one path, as text. `undefined` puts the id back instead of blanking the cell. */
type IdRefDisplayResolver = (
  targetKind: string,
  id: string,
  displayField: string,
) => string | undefined;

/** Baseline name for an id with no column-level choice. `targetKind` is a hint: a mixed column has none, so the resolver reads it off the id. */
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
 * Text to show in place of a reference's id, or `undefined` for "show the id".
 * A configured `displayField` wins; otherwise `resolveDefault` gets a turn; any
 * missing piece falls through to the plain id.
 *
 * The identity field is exempt from the default: it infers as `idRef` to its
 * own collection, so the default resolver would return the record's own name
 * and hide the id the column exists to show. An explicit `displayField` still wins.
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
  if (isIdentityField(field.path)) return undefined;
  return resolveDefault?.(id, field.targetKind);
};

export { substituteDisplay };
export type {
  DisplaySubstitution, IdRefDefaultResolver, IdRefDisplayResolver, IdRefTargetField, IdRefTargetFieldResolver,
};
