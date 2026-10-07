/* @layer renderer-widgets @kind hook */
/**
 * The three ways a HUD number is edited in place. A click opens a field over the digits with
 * the value selected; Enter or blur commits it clamped to min..max, Escape drops it. A wheel
 * tick moves the value by one, or to the next rung when the number lives on a ladder. A right
 * click opens the step box, which the caller draws. The value stays in the game: every commit
 * goes through `write`, and the field is seeded from the live value when it opens.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { useWheel } from '../../../behavior/useWheel';

type NumberEditParams = {
  value: number;
  min: number;
  max: number;
  write: (next: number) => void;
  ladder?: readonly number[];
};

const clampTo = (min: number, max: number, n: number): number => Math.min(max, Math.max(min, Math.round(n)));

/** The neighbouring rung in `dir`; the value itself at either end. */
const rungFrom = (ladder: readonly number[], value: number, dir: 1 | -1): number => {
  const at = ladder.findIndex((rung) => rung >= value);
  const index = at < 0 ? ladder.length - 1 : at;
  const next = index + (dir === 1 ? (ladder[index] === value ? 1 : 0) : -1);
  return ladder[Math.min(ladder.length - 1, Math.max(0, next))];
};

const useNumberEdit = ({ value, min, max, write, ladder }: NumberEditParams) => {
  const [draft, setDraft] = useState<string | null>(null);
  const [setterAnchor, setSetterAnchor] = useState<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isEditing = draft !== null;

  const latest = useRef({ value, min, max, write, ladder, draft });
  latest.current = { value, min, max, write, ladder, draft };
  // The value a wheel tick last wrote, until the game reports a value of its own.
  const pending = useRef<number | null>(null);
  useEffect(() => { pending.current = null; }, [value]);

  const hostRef = useWheel<HTMLDivElement>((dir) => {
    const { value: live, min: lo, max: hi, write: put, ladder: rungs } = latest.current;
    const current = pending.current ?? live;
    const next = rungs && rungs.length > 0 ? rungFrom(rungs, current, dir) : clampTo(lo, hi, current + dir);
    if (next === current) return;
    pending.current = next;
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

export { useNumberEdit, rungFrom };
export type { NumberEditParams };
