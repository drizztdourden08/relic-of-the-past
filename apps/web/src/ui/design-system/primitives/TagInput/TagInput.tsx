/* @layer renderer-components @kind component */
/**
 * A creatable combobox for a list of string values.
 *
 * It searches what already exists first: type, and the panel filters the values
 * handed in as `suggestions`. By default it never refuses a value that is not
 * there yet, because a real vocabulary grows. The convention check is the same
 * bargain: it flags an entry that does not read `namespace:value` and commits
 * it anyway.
 *
 * `enforce` is the opt-out, for a field where creating a value means creating a
 * RECORD instead of appending a string. There the convention is the record's
 * own shape, so an entry that does not follow it has nowhere to be filed and is
 * refused. Picking an existing value is never refused either way.
 */
import { useId } from 'react';
import { useTagInput } from './behavior/use-tag-input';
import { adviseTag } from './behavior/tag-convention';
import { TagChip } from './sub-components/TagChip';
import { TagSuggestionPanel } from './sub-components/TagSuggestionPanel';
import type { TagInputProps } from './TagInput.type';
import './TagInput.css';

const NO_SUGGESTIONS: readonly string[] = [];
const DEFAULT_MAX_SUGGESTIONS = 50;

const TagInput = (props: TagInputProps) => {
  const {
    value,
    onChange,
    suggestions = NO_SUGGESTIONS,
    validate,
    enforce = false,
    createError,
    placeholder = 'Add a tag...',
    disabled = false,
    label,
    maxSuggestions = DEFAULT_MAX_SUGGESTIONS,
    className = '',
    id,
  } = props;

  const generatedId = useId();
  const fieldId = id ?? `tag-input-${generatedId}`;
  const listId = `${fieldId}-list`;
  const optionId = (idx: number) => `${fieldId}-opt-${idx}`;

  const tags = useTagInput({
    value, onChange, suggestions, maxSuggestions, disabled, validate, enforce, createError,
  });
  const { popup } = tags;

  // The live convention advice wins while there is one, since it is about what
  // is typed right now. A past creation failure only gets the slot once the entry
  // has nothing more current to say.
  const hintMessage = tags.advice.message ?? tags.createError;
  const hintDanger = tags.blocked || (tags.advice.message == null && tags.createError != null);

  const rootCls = ['tag-input', disabled && 'tag-input--disabled', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootCls}>
      {label != null && (
        <label className="tag-input__label" htmlFor={fieldId}>
          {label}
        </label>
      )}

      <div ref={popup.anchorRef} className="tag-input__field">
        {value.map((tag, idx) => (
          <TagChip
            key={tag}
            tag={tag}
            advice={adviseTag(tag, validate)}
            disabled={disabled}
            onRemove={() => tags.handleRemove(idx)}
          />
        ))}

        <input
          id={fieldId}
          ref={tags.inputRef}
          type="text"
          role="combobox"
          className="tag-input__entry"
          autoComplete="off"
          aria-invalid={tags.blocked || undefined}
          aria-expanded={popup.open}
          aria-controls={popup.open ? listId : undefined}
          aria-activedescendant={
            popup.open && tags.highlightIdx >= 0 ? optionId(tags.highlightIdx) : undefined
          }
          placeholder={value.length === 0 ? placeholder : ''}
          value={tags.query}
          disabled={disabled}
          onChange={(e) => tags.handleQueryChange(e.target.value)}
          onFocus={popup.handleOpen}
          onKeyDown={tags.handleKeyDown}
        />
      </div>

      {hintMessage != null && (
        <span className="tag-input__hint" data-blocked={hintDanger || undefined}>
          {hintMessage}
        </span>
      )}

      {popup.open && !disabled && (
        <TagSuggestionPanel
          listId={listId}
          optionId={optionId}
          panelRef={popup.panelRef}
          pos={popup.pos}
          suggestions={tags.filtered}
          highlightIdx={tags.highlightIdx}
          createText={tags.createText}
          onPick={tags.commit}
        />
      )}
    </div>
  );
};

export { TagInput };
