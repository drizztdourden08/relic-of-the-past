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

/** A column's display choice paired with whoever can answer it. */
interface DisplaySubstitution {
  /** A path in the TARGET collection's schema; absent means show the id. */
  displayField?: string;
  resolve?: IdRefDisplayResolver;
}

const asId = (value: unknown): string => {
  if (value === undefined || value === null) return '';
  return typeof value === 'string' ? value.trim() : String(value).trim();
};

/**
 * The text to show in place of a reference's id, or `undefined` for "show the
 * id". Every missing piece — no choice, no resolver, no target, no value —
 * falls through to that same answer, so a half-wired table degrades to the
 * plain id instead of to a hole.
 */
const substituteDisplay = (
  value: unknown,
  field: FieldDescriptor,
  substitution?: DisplaySubstitution,
): string | undefined => {
  const { displayField, resolve } = substitution ?? {};
  if (!displayField || !resolve || !field.targetKind) return undefined;
  const id = asId(value);
  return id ? resolve(field.targetKind, id, displayField) : undefined;
};

export { substituteDisplay };
export type {
  DisplaySubstitution, IdRefDisplayResolver, IdRefTargetField, IdRefTargetFieldResolver,
};
