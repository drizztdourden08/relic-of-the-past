/* @layer renderer-components @kind hook */
/**
 * The draft/commit half of `TextValueField`. It applies `use-value-input.ts`'s
 * rules to the one property whose literal side is a STRING, not a number.
 *
 * NO MODE, AND SO NOTHING TO LOSE. The bug this replaces was structural: the
 * outer `text | ƒx` `SegmentedControl` wrote `''` on the way from `data` to
 * `text` and `{ from: 'data', expr: '0' }` on the way back, so a round trip
 * through the switch destroyed whatever formula was there, while the INNER
 * `ValueField` it wrapped went to some trouble to preserve exactly that. There
 * is one field now, holding one string, and `=` in front of it is the only
 * thing that means "formula".
 *
 * COMMIT TIMING IS `use-value-input.ts`'S, FOR ITS REASONS. A literal commits
 * on change, so the stage tracks the word being typed. A formula commits on
 * blur or Enter, so a half-typed `life_current /` never reaches the document
 * and never flashes the stage to zero. Escape abandons the draft and marks the
 * key handled, which is what contract §33.4 asks of an inline editor.
 */
import { useRef, useState } from 'react';
import { exprOf, isFormulaText, textOfTextValue, textValueOf, withFormulaMarker } from './value-text';
import type { Value } from '@shared/types/hud';

interface UseTextValueParams {
  value: Value | string;
  onChange: (next: Value | string) => void;
}

const useTextValue = (params: UseTextValueParams) => {
  const { value, onChange } = params;
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const text = draft ?? textOfTextValue(value);
  const formula = isFormulaText(text);

  const commit = (next: string): void => {
    setDraft(null);
    onChange(textValueOf(next));
  };

  const handleChange = (next: string): void => {
    setDraft(next);
    if (!isFormulaText(next)) commit(next);
  };

  const handleKeyDown = (key: string, prevent: () => void): void => {
    if (key === 'Escape') { setDraft(null); prevent(); return; }
    if (key === 'Enter') { commit(text); prevent(); }
  };

  const handleBlur = (): void => {
    setFocused(false);
    // Nothing uncommitted means nothing to write: a blur that re-sent the same
    // value would mark the draft dirty for a click that changed nothing.
    if (draft !== null) commit(text);
  };

  /** The `=` chip, which is `ValueInput`'s own affordance: it appears on focus
   *  and does what typing `=` does, keeping the digits already in the field. */
  const startFormula = (): void => {
    setDraft(withFormulaMarker(text));
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return {
    inputRef,
    text,
    expr: formula ? exprOf(text) : null,
    /** An edit that has not reached the document, which is why a result is withheld. */
    dirty: draft !== null,
    focused,
    formula,
    handleBlur,
    handleChange,
    handleFocus: () => setFocused(true),
    handleKeyDown,
    startFormula,
  };
};

export { useTextValue };
export type { UseTextValueParams };
