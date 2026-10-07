/* @layer renderer-components @kind logic */
/**
 * Which list of strings is a list of tags. Nothing in the values separates a
 * tag list from free text, so the signal is the name: a field called `tags`
 * holding strings or references is a tag list by convention, at any depth.
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
