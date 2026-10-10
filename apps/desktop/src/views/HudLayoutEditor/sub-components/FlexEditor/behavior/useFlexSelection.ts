/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useEscapeStack } from '@drizztdourden08/tessera/primitives';
import { usePlatform } from '@drizztdourden08/brock-react';
import { nextIndexRun } from '@app/hud-layout-editing/index-selection';
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

  useEscapeStack({ active: selection.kind !== 'none', level: 'popover', onEscape: clear });

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
