/* @layer renderer-components @kind hook */
/**
 * The seven states of `ValueInput`, as one draft string and two booleans.
 *
 * COMMIT TIMING DIFFERS BETWEEN THE TWO CONTENTS, on purpose. A number commits
 * on CHANGE, so dragging the spinner tracks on the stage. A formula commits on
 * BLUR or ENTER, so a half-typed `life_current /` never reaches the document
 * and never flashes the stage to zero. That is why state 4 withholds its result
 * instead of guessing: a mid-edit formula that showed `→ 0` would be a lie on
 * every keystroke.
 *
 * ESCAPE IS NOT ALWAYS OURS. With the menu open the menu owns it. It sits on
 * the dismiss stack at `popover` (contract §33), which beats the layer behind
 * it, and this handler must NOT consume the key or the menu would never close.
 * With the menu shut the field owns it: the edit is abandoned and
 * `preventDefault()` marks the key handled, which is the contract §33.4 asks of
 * every inline editor so the panel behind does not close too.
 *
 * ARROWS ARE REDIRECTED, NEVER LOST. While the text is a bare numeral they
 * nudge the number; while it is a formula they move the completion selection,
 * which is where a hand in a formula wants them.
 */
import { useRef, useState } from 'react';
import { exprOf, isFormulaText, stepsAsNumber, textOf, valueOf, withFormulaMarker } from '../../../behavior/value-text';
import type { Value } from '@shared/types/hud';

interface UseValueInputParams {
  value: Value | undefined;
  onChange: (next: Value) => void;
  /**
   * OPTIONAL PROPERTIES ONLY. Given, an emptied field DELETES the key instead
   * of reverting to what the document held. That is the rule phase 6's `MinMaxField`
   * needed and §36.9 deferred to it. Omitted, an empty field behaves exactly as
   * it did: a draft that never commits, with the placeholder saying so.
   */
  onClear?: () => void;
  step: number;
  min?: number;
  max?: number;
}

const clamp = (n: number, min?: number, max?: number): number => {
  if (min !== undefined && n < min) return min;
  if (max !== undefined && n > max) return max;
  return n;
};

/** The identifier the caret is sitting at the end of, which the completion
 *  filters on. Empty when the caret follows anything else, which is how
 *  "offer nothing but a value directly after a (" falls out for free. */
const prefixAt = (text: string, caret: number): string =>
  (/([A-Za-z_]\w*)$/.exec(text.slice(0, caret))?.[1] ?? '');

const useValueInput = (params: UseValueInputParams) => {
  const { value, onChange, onClear, step, min, max } = params;
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [prefix, setPrefix] = useState('');

  const text = draft ?? textOf(value);
  const formula = isFormulaText(text);

  const commit = (next: string): void => {
    if (onClear && next.trim() === '') { setDraft(null); onClear(); return; }
    const parsed = valueOf(next);
    if (parsed !== null) {
      onChange(parsed);
      setDraft(null);
      return;
    }
    setDraft(next);
  };

  const put = (next: string, caret?: number): void => {
    setDraft(next);
    setPrefix(prefixAt(next, caret ?? next.length));
    if (stepsAsNumber(next)) { commit(next); setMenuOpen(false); }
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (el && caret !== undefined) el.setSelectionRange(caret, caret);
    });
  };

  const handleChange = (next: string, caret: number): void => {
    setDraft(next);
    // Emptying is committed on CHANGE, like a number and unlike a formula:
    // there is nothing half-typed about an empty field, and waiting for blur
    // would leave the stage showing a limit that has already been rubbed out.
    if (onClear && next.trim() === '') { setDraft(null); setPrefix(''); onClear(); return; }
    const at = prefixAt(next, caret);
    setPrefix(at);
    if (stepsAsNumber(next)) { onChange(Number(next.trim())); setMenuOpen(false); return; }
    if (isFormulaText(next) && at.length > 0) setMenuOpen(true);
  };

  const stepBy = (dir: 1 | -1): void => {
    if (!stepsAsNumber(text)) return;
    const next = clamp(Number((Number(text) + dir * step).toFixed(6)), min, max);
    put(String(next));
    onChange(next);
  };

  /** Replace the identifier under the caret, or insert at it. Never appends to
   *  the end. That was the `+ var` Select's own bug, which was correct only when the
   *  caret happened to be there. */
  const insert = (snippet: string, select?: string): void => {
    const el = inputRef.current;
    const caret = el?.selectionStart ?? text.length;
    const head = text.slice(0, caret - prefix.length);
    const tail = text.slice(caret);
    const next = withFormulaMarker(`${head}${snippet}${tail}`);
    const at = next.indexOf(select ?? snippet, Math.max(0, next.length - snippet.length - tail.length - 4));
    setMenuOpen(false);
    setPrefix('');
    setDraft(next);
    requestAnimationFrame(() => {
      const target = inputRef.current;
      if (!target) return;
      target.focus();
      const from = at < 0 ? next.length : at;
      target.setSelectionRange(from, from + (select ?? snippet).length);
    });
  };

  const startFormula = (): void => {
    put(withFormulaMarker(text));
    setMenuOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleKeyDown = (key: string, prevent: () => void): void => {
    if (key === 'Escape') {
      if (menuOpen) return;
      setDraft(null);
      setPrefix('');
      prevent();
      return;
    }
    if (key === 'Enter') { commit(text); setMenuOpen(false); prevent(); return; }
    if (key !== 'ArrowUp' && key !== 'ArrowDown') return;
    if (stepsAsNumber(text)) { stepBy(key === 'ArrowUp' ? 1 : -1); prevent(); }
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
    /** An edit that has not reached the document. It is why the result is withheld. */
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

export { prefixAt, useValueInput };
export type { UseValueInputParams };
