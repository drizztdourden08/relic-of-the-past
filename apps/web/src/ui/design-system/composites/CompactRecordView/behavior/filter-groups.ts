/* @layer renderer-components @kind logic */
/**
 * The optional allow-list a caller passes to `CompactRecordView`: group ids
 * from `layoutGroups`, individual field paths, or a mix of both.
 *
 * A listed group id keeps the whole group, fields and all. Anything else is
 * checked field-by-field against the same list, so a caller can pull a
 * handful of fields out of a group without asking for the rest of it — the
 * widget wants exactly this for a wide collection (e.g. `connection`), where
 * every field does not fit a floating panel a few hundred pixels wide.
 *
 * Omitting the list is not "show nothing extra" — it is "no filter at all",
 * so every group `layoutGroups` produced comes through unchanged.
 */
import type { EditorGroupModel } from '../../RecordEditor';

const filterGroups = (
  groups: readonly EditorGroupModel[],
  allow?: readonly string[],
): readonly EditorGroupModel[] => {
  if (!allow) return groups;
  const list = new Set(allow);
  return groups
    .map((group): EditorGroupModel => (
      list.has(group.id) ? group : { ...group, fields: group.fields.filter((field) => list.has(field.path)) }
    ))
    .filter((group) => group.fields.length > 0);
};

export { filterGroups };
