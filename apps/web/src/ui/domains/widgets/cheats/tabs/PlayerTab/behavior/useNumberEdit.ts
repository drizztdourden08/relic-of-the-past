/* @layer renderer-widgets @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { useWheel } from '../../../behavior/useWheel';
import { rungFrom } from './rung-from';
import type { NumberEditParams } from '../PlayerTab.type';

const clampTo = (min: number, max: number, n: number): number => Math.min(max, Math.max(min, Math.round(n)));

const useNumberEdit = ({ value, min, max, write, ladder }: NumberEditParams) => {
  const [draft, setDraft] = useState<string | null>(null);
  const [setterAnchor, setSetterAnchor] = useState<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isEditing = draft !== null;

  const latest = useRef({ value, min, max, write, ladder, draft });
  latest.current = { value, min, max, write, ladder, draft };
  const wheelWriteAwaitingGame = useRef<number | null>(null);
  useEffect(() => { wheelWriteAwaitingGame.current = null; }, [value]);

  const hostRef = useWheel<HTMLDivElement>((dir) => {
    const { value: live, min: lo, max: hi, write: put, ladder: rungs } = latest.current;
    const current = wheelWriteAwaitingGame.current ?? live;
    const next = rungs && rungs.length > 0 ? rungFrom(rungs, current, dir) : clampTo(lo, hi, current + dir);
    if (next === current) return;
    wheelWriteAwaitingGame.current = next;
    put(next);
  });

  const begin = useCallback(() => setDraft(String(latest.current.value)), []);
  const cancel = useCallback(() => setDraft(null), []);
  const openSetter = useCallback((e: MouseEvent) => { e.preventDefault(); setSetterAnchor(e.currentTarget as HTMLElement); }, []);
  const closeSetter = useCallback(() => setSetterAnchor(null), []);

  const commit = useCallback(() => {
    const { draft: current, min: lo, max: hi, write: put } = latest.current;
    if (current === null) return;
    const n = Number(current);
    if (current.trim() !== '' && Number.isFinite(n)) put(clampTo(lo, hi, n));
    setDraft(null);
  }, []);

  const onKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
    if (e.key === 'Escape') { e.preventDefault(); cancel(); }
  }, [commit, cancel]);

  useEffect(() => {
    if (!isEditing) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [isEditing]);

  return {
    hostRef, inputRef, draft, isEditing, setDraft, begin, commit, cancel, onKeyDown,
    setterAnchor, openSetter, closeSetter,
  };
};

export { useNumberEdit };
