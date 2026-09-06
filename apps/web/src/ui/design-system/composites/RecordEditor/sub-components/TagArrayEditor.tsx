/* @layer renderer-components @kind component */
/**
 * A tag list edited as a tag list: picked far more often than invented,
 * unordered, one vocabulary across the collection. A referenced tag list gets
 * the same entry with terms looked up through the reference resolver. Creating
 * a referenced term mints a record, which only the caller can do via
 * `onCreateTag`, so the entry enforces the `namespace:value` convention here
 * and only here. A failure past that check is shown as `createError` instead
 * of the chip silently not appearing.
 */
import { useCallback, useMemo, useState } from 'react';
import { TagInput } from '../../../primitives/TagInput';
import { toList, toText } from '../../field-kits/coerce';
import { buildTagKeyMap } from '../behavior/tag-key-map';
import { isReferencedTagList } from '../behavior/tag-field';
import type { IdRefOption } from '../../field-kits/registry';
import type { TagArrayEditorProps } from '../RecordEditor.type';
import '../RecordEditor.css';

const NO_SUGGESTIONS: readonly string[] = [];
const NO_OPTIONS: readonly IdRefOption[] = [];
const PLACEHOLDER = 'Search or add a tag...';

const TagArrayEditor = (props: TagArrayEditorProps) => {
  const { field, value, binding } = props;
  const referenced = isReferencedTagList(field);
  const targetKind = field.of?.targetKind ?? '';

  const options = referenced
    ? binding.resolveIdRefOptions?.(targetKind, field) ?? NO_OPTIONS
    : NO_OPTIONS;
  const map = useMemo(() => buildTagKeyMap(options), [options]);

  const stored = useMemo(() => toList(value).map(toText), [value]);
  const shown = useMemo(
    () => (referenced ? stored.map(map.keyOfId) : stored),
    [referenced, stored, map],
  );
  const suggestions = binding.resolveTagSuggestions?.(field) ?? NO_SUGGESTIONS;

  // Why the last attempt was refused. Cleared when a fresh attempt starts, so a
  // retry of the same key still shows its failure.
  const [createError, setCreateError] = useState<string | null>(null);

  const handleChange = useCallback(
    (next: readonly string[]) => {
      if (!referenced) {
        binding.onChange(field.path, [...next]);
        return;
      }
      // A known term writes its id; an unknown one goes to the caller, which
      // mints the record and returns the id to append. A chip the lookup could
      // not name shows its raw id and comes back unchanged, so it is kept.
      const resolved: string[] = [];
      const invented: string[] = [];
      for (const key of next) {
        const id = map.idOfKey(key) ?? (stored.includes(key) ? key : undefined);
        if (id) resolved.push(id);
        else invented.push(key);
      }
      binding.onChange(field.path, resolved);
      for (const key of invented) {
        setCreateError(null);
        void binding.onCreateTag?.(key).then((outcome) => {
          if (outcome.success) binding.onChange(field.path, [...resolved, outcome.id]);
          else setCreateError(outcome.error);
        });
      }
    },
    [referenced, binding, field.path, map, stored],
  );

  return (
    <TagInput
      id={field.path}
      className="record-editor__tags"
      value={shown}
      suggestions={suggestions}
      placeholder={PLACEHOLDER}
      enforce={referenced}
      disabled={binding.disabled}
      createError={createError}
      onChange={handleChange}
    />
  );
};

export { TagArrayEditor };
