/* @layer renderer-components @kind component */
/**
 * A tag list, edited as a tag list.
 *
 * The row editor is the wrong shape for this one case. A tag is picked far more
 * often than it is invented, the vocabulary lives across the whole collection
 * rather than on this record, and the order tags happen to sit in carries
 * nothing — so N text boxes with arrows beside them make the common edit the
 * slow one and the meaningless operation the prominent one. That argument does
 * not change when the values become REFERENCES: it is still one vocabulary,
 * still unordered, still picked far more often than invented. So a referenced
 * tag list gets the same entry, with the terms looked up through the reference
 * resolver the editor already carries.
 *
 * A referenced list also changes what "create" means. Adding an unknown string
 * to a list of strings is free; adding an unknown term to a list of references
 * means minting a RECORD, which only the caller can do — hence `onCreateTag`,
 * and hence the entry ENFORCING the convention here and only here. A record
 * that does not read `namespace:value` has no namespace to be filed under, so
 * there is nothing to create; a plain string list keeps the advisory behaviour.
 *
 * `onCreateTag` can still fail past that check — a revalidation the caller
 * runs and this editor cannot, a duplicate the local vocabulary did not know
 * about. That failure is kept here rather than dropped, and handed to the
 * entry as `createError` so it shows exactly where the attempt was made,
 * instead of the typed chip just quietly failing to appear.
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
const PLACEHOLDER = 'Search or add a tag…';

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

  // The one attempt still in flight, or the reason the last one was refused.
  // Superseded the moment a fresh attempt starts, so a retry of the exact same
  // key still shows a failure rather than silently keeping the stale one hidden.
  const [createError, setCreateError] = useState<string | null>(null);

  const handleChange = useCallback(
    (next: readonly string[]) => {
      if (!referenced) {
        binding.onChange(field.path, [...next]);
        return;
      }
      // A term the vocabulary already holds writes its id straight away; one it
      // does not is handed to the caller, which mints the record and comes back
      // with the id to append. Nothing unresolved is ever written.
      //
      // A chip the lookup could not name shows its raw id, and that id comes
      // back here unchanged — it is a reference the record already holds, not
      // something invented, so it is kept rather than dropped or re-created.
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
