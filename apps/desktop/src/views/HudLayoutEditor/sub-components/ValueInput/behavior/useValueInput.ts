/* @layer renderer-components @kind hook */
import { exprOf, isFormulaText, stepsAsNumber, withFormulaMarker } from '@app/hud-layout-editing/value-text';
import { keyIntentOf } from './key-intent-of';
import { spliceSnippet } from './splice-snippet';
import { useValueEditing } from './useValueEditing';
import type { UseValueInputParams } from './useValueInput.type';

const useValueInput = (params: UseValueInputParams) => {
  const editing = useValueEditing(params);
  const {
    inputRef, draft, text, focused, menuOpen, prefix,
    setDraft, setFocused, setMenuOpen, setPrefix, commit, put, handleChange, stepBy,
  } = editing;
  const formula = isFormulaText(text);

  const insert = (snippet: string, select?: string): void => {
    const caret = inputRef.current?.selectionStart ?? text.length;
    const { next, from, to } = spliceSnippet({ text, caret, prefix, snippet, select });
    setMenuOpen(false);
    setPrefix('');
    setDraft(next);
    requestAnimationFrame(() => {
      const target = inputRef.current;
      if (!target) return;
      target.focus();
      target.setSelectionRange(from, to);
    });
  };

  const startFormula = (): void => {
    put(withFormulaMarker(text));
    setMenuOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleKeyDown = (key: string, prevent: () => void): void => {
    const intent = keyIntentOf(key, menuOpen, text);
    if (intent === 'none') return;
    if (intent === 'cancel') { setDraft(null); setPrefix(''); }
    if (intent === 'commit') { commit(text); setMenuOpen(false); }
    if (intent === 'up') stepBy(1);
    if (intent === 'down') stepBy(-1);
    prevent();
  };

  const handleBlur = (): void => {
    setFocused(false);
    if (menuOpen) return;
    commit(text);
  };

  return {
    inputRef,
    text,
    expr: formula ? exprOf(text) : null,
    dirty: draft !== null,
    focused,
    formula,
    menuOpen,
    prefix,
    canStep: stepsAsNumber(text),
    closeMenu: () => setMenuOpen(false),
    openMenu: () => setMenuOpen(true),
    handleBlur,
    handleChange,
    handleFocus: () => setFocused(true),
    handleKeyDown,
    insert,
    startFormula,
    stepBy,
  };
};

export { useValueInput };
