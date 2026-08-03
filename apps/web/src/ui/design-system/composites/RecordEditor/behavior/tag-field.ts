/* @layer renderer-components @kind logic */
/**
 * Which list of strings is a list of TAGS.
 *
 * A tag list and a list of free text are the same type and want opposite
 * editors: a tag is drawn from a shared vocabulary that already exists
 * elsewhere, so the edit is "search, then pick or create", while free text is a
 * sequence where order and each individual value matter. Nothing in the derived
 * schema separates them, because nothing in the VALUES separates them — both
 * are `string[]`, and a vocabulary large enough (over the enum threshold)
 * cannot be read as a closed set either.
 *
 * So the signal is the name. A field called `tags` holding strings is a tag
 * list by convention, at any depth, in any collection. That is a heuristic and
 * is meant to read as one: it is honest about matching a name rather than
 * pretending to have inferred something the data does not say.
 *
 * A tag list whose values are REFERENCES gets the same entry. It is the same
 * edit — search a shared vocabulary, pick or create — and the rows the generic
 * array editor would render are wrong for it in exactly the ways described
 * above, reference or not. What changes is only that the entry has to show the
 * term behind an id, which is a lookup the caller injects and the editor
 * already knows how to ask for.
 */
import type { FieldDescriptor } from '../../../data/schema/field-descriptor';

const TAGS_KEY = 'tags';

/** The last dot segment of a path, which is the field's own key. */
const keyOf = (path: string): string => path.slice(path.lastIndexOf('.') + 1);

/** True when the elements are references, so the entry has terms to look up. */
const isReferencedTagList = (field: FieldDescriptor): boolean => field.of?.kind === 'idRef';

const isTagsField = (field: FieldDescriptor): boolean =>
  field.kind === 'array'
  && (field.of?.kind === 'string' || field.of?.kind === 'idRef')
  && keyOf(field.path) === TAGS_KEY;

export { isReferencedTagList, isTagsField, keyOf, TAGS_KEY };
