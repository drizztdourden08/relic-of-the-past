/* @layer renderer-components @kind hook */
/**
 * The flex strip's selection. A press writes NOTHING (§58).
 *
 * That is the lattice's rule, kept word for word: a click, a `{mod}`-click and a
 * `Shift`-click all leave the document byte-identical, and what they change is
 * which rows the toolbar offers and which children the stage echoes. The bug it
 * exists to prevent is §48's, where picking something to act on performed the
 * act instead.
 *
 * THE PICK RULE IS NOT WRITTEN HERE. A strip of numbered things answers a press
 * one way, and `behavior/index-selection.ts` is that way. It is the same function the
 * grid's track headers call, so the two strips cannot drift into two different
 * `Shift`s.
 *
 * `Escape` REGISTERS ON THE DISMISS STACK AT `popover` (§33), so it clears the
 * selection and leaves the editor's own layer standing behind it.
 *
 * THE SELECTION IS DROPPED WHEN THE COUNT CHANGES, not remapped. A move keeps
 * the same children in the same container, so the indices still name something.
 * But a child arriving or leaving through the outline would silently re-point
 * every index, and a toolbar acting on a different child than the one lit is
 * worse than a toolbar that asks to be told again.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDismissable } from '@ds/primitives/Portal';
import { usePlatform } from '@app/platform';
import { nextIndexRun } from '../../../behavior/index-selection';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { FlexSelection } from '../FlexEditor.type';

const useFlexSelection = (containerId: string, count: number) => {
  const os = usePlatform().info.os;
  const [selection, setSelection] = useState<FlexSelection>({ kind: 'none' });
  const [cursor, setCursor] = useState(0);
  const [refusal, setRefusal] = useState<string | null>(null);
  const known = useRef(count);

  useEffect(() => {
    setSelection({ kind: 'none' });
    setRefusal(null);
    setCursor(0);
  }, [containerId]);

  useEffect(() => {
    if (known.current === count) return;
    known.current = count;
    setSelection({ kind: 'none' });
  }, [count]);

  const select = useCallback((next: FlexSelection): void => {
    setRefusal(null);
    setSelection(next);
  }, []);

  const clear = useCallback(() => select({ kind: 'none' }), [select]);

  useDismissable({ active: selection.kind !== 'none', level: 'popover', onDismiss: clear });

  const pick = useCallback((index: number, event: ReactPointerEvent): void => {
    setCursor(index);
    setSelection((current) => {
      const next = nextIndexRun(current.kind === 'items' ? current : null, index, event, os);
      return next ? { kind: 'items', ...next } : { kind: 'none' };
    });
    setRefusal(null);
  }, [os]);

  return { os, selection, cursor, refusal, select, clear, setCursor, refuse: setRefusal, pick };
};

export { useFlexSelection };
