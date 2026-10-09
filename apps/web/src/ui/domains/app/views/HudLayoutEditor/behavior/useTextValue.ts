/* @layer renderer-components @kind hook */
import { useRef, useState } from 'react';
import { exprOf, isFormulaText, textOfTextValue, textValueOf, withFormulaMarker } from './value-text';
import type { UseTextValueParams } from './useTextValue.type';

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
    if (draft !== null) commit(text);
  };

  const startFormula = (): void => {
    setDraft(withFormulaMarker(text));
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return {
    inputRef,
    text,
    expr: formula ? exprOf(text) : null,
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
export type { UseTextValueParams } from './useTextValue.type';
