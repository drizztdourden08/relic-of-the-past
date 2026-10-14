/* @layer renderer-components @kind hook */
import { useRef, useState } from 'react';
import { isFormulaText, stepsAsNumber, textOf, valueOf } from '@app/hud-layout-editing/value-text';
import { clampToRange } from './clamp-to-range';
import { prefixAt } from './prefix-at';
import type { UseValueInputParams } from './useValueInput.type';

const useValueEditing = (params: UseValueInputParams) => {
  const { value, onChange, onClear, step, min, max } = params;
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [prefix, setPrefix] = useState('');
  const text = draft ?? textOf(value);

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
    if (onClear && next.trim() === '') { setDraft(null); setPrefix(''); onClear(); return; }
    const at = prefixAt(next, caret);
    setPrefix(at);
    if (stepsAsNumber(next)) { onChange(Number(next.trim())); setMenuOpen(false); return; }
    if (isFormulaText(next) && at.length > 0) setMenuOpen(true);
  };

  const stepBy = (dir: 1 | -1): void => {
    if (!stepsAsNumber(text)) return;
    const next = clampToRange(Number((Number(text) + dir * step).toFixed(6)), min, max);
    put(String(next));
    onChange(next);
  };

  return {
    inputRef, draft, text, focused, menuOpen, prefix,
    setDraft, setFocused, setMenuOpen, setPrefix, commit, put, handleChange, stepBy,
  };
};

export { useValueEditing };
