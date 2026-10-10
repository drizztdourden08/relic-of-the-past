/* @layer renderer-components @kind hook */
import { useRef, useState } from 'react';
import { exprOf, isFormulaText, stepsAsNumber, textOf, valueOf, withFormulaMarker } from '@app/hud-layout-editing/value-text';
import { clampToRange } from './clamp-to-range';
import { prefixAt } from './prefix-at';
import type { UseValueInputParams } from './useValueInput.type';

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
