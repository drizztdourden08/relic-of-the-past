/* @layer renderer-components @kind hook */
/**
 * The control's state: what has been typed, which row is highlighted, and the
 * one place a value is committed.
 *
 * The highlight sits at -1 until an arrow key moves it, and -1 is meaningful:
 * it is what hands Enter to the typed text instead of to a row, which is how
 * the same key both picks an existing value and creates a new one.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTagPopup } from './use-tag-popup';
import { adviseTag, blocksCreate } from './tag-convention';
import {
  addTag,
  filterSuggestions,
  isNewValue,
  normalizeTag,
  removeAt,
  removeLast,
  resolveCommit,
} from './tag-values';
import type { KeyboardEvent } from 'react';
import type { TagValidator } from '../TagInput.type';

interface UseTagInputParams {
  value: readonly string[];
  onChange: (next: readonly string[]) => void;
  suggestions: readonly string[];
  maxSuggestions: number;
  disabled: boolean;
  validate?: TagValidator;
  /** Refuses a NEW value the check rejects; existing values are never refused. */
  enforce?: boolean;
  /** A failure past this control's own check. See `TagInputProps.createError`. */
  createError?: string | null;
}

const useTagInput = (params: UseTagInputParams) => {
  const {
    value, onChange, suggestions, maxSuggestions, disabled, validate, enforce = false, createError,
  } = params;

  const [query, setQuery] = useState('');
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const popup = useTagPopup(disabled);

  // Latched locally instead of read straight off the prop: a fresh failure
  // should show up right away, but the moment the entry is edited again the
  // message is stale, and the caller has no way to know that happened.
  const [visibleCreateError, setVisibleCreateError] = useState<string | null>(createError ?? null);
  useEffect(() => setVisibleCreateError(createError ?? null), [createError]);

  const filtered = useMemo(
    () => filterSuggestions({ suggestions, query, selected: value, limit: maxSuggestions }),
    [suggestions, query, value, maxSuggestions],
  );

  const advice = adviseTag(query, validate);
  const isNew = isNewValue(query, suggestions);
  const blocked = blocksCreate({ raw: query, isNew, enforce, validate });
  const createText = isNew && !blocked ? normalizeTag(query) : null;

  /** Adds one value and clears the entry, leaving the panel open for the next. */
  const commit = useCallback(
    (raw: string) => {
      const next = addTag(value, raw);
      if (next !== value) onChange(next);
      setQuery('');
      setHighlightIdx(-1);
      inputRef.current?.focus();
    },
    [value, onChange],
  );

  const commitTyped = useCallback(() => {
    if (blocked) return;
    const tag = resolveCommit(query, suggestions);
    if (tag !== null) commit(tag);
  }, [blocked, query, suggestions, commit]);

  const handleQueryChange = useCallback(
    (next: string) => {
      setQuery(next);
      setHighlightIdx(-1);
      setVisibleCreateError(null);
      popup.handleOpen();
    },
    [popup],
  );

  const handleRemove = useCallback(
    (index: number) => {
      const next = removeAt(value, index);
      if (next !== value) onChange(next);
    },
    [value, onChange],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          popup.handleOpen();
          setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
          break;
        }
        case 'ArrowUp': {
          // Stepping back off the first row returns to the typed text, which is
          // the way out of the list without reaching for the mouse.
          e.preventDefault();
          setHighlightIdx((i) => Math.max(i - 1, -1));
          break;
        }
        case 'Enter': {
          e.preventDefault();
          if (highlightIdx >= 0 && highlightIdx < filtered.length) commit(filtered[highlightIdx]);
          else commitTyped();
          break;
        }
        case 'Backspace': {
          if (query !== '') break;
          const next = removeLast(value);
          if (next !== value) {
            e.preventDefault();
            onChange(next);
          }
          break;
        }
        case 'Tab': {
          popup.handleClose();
          break;
        }
      }
    },
    [popup, filtered, highlightIdx, commit, commitTyped, query, value, onChange],
  );

  return {
    query,
    filtered,
    createText,
    advice,
    blocked,
    createError: visibleCreateError,
    highlightIdx,
    inputRef,
    popup,
    commit,
    handleQueryChange,
    handleKeyDown,
    handleRemove,
  };
};

export { useTagInput };
export type { UseTagInputParams };
