/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { PreviewControlsParams } from '../preview.type';

const usePreviewControls = (params: PreviewControlsParams) => {
  const { atEnd, optionCount, onAdvance, onRestart } = params;

  const [selected, setSelected] = useState(0);
  const [advanceTick, setAdvanceTick] = useState(0);
  const stageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    stageRef.current?.focus();
  }, []);

  const handleActivate = useCallback(() => {
    setSelected(0);
    if (atEnd) {
      onRestart();
      return;
    }
    setAdvanceTick((tick) => tick + 1);
    onAdvance();
  }, [atEnd, onAdvance, onRestart]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    const { key } = event;
    if (key === ' ' || key === 'Enter') {
      event.preventDefault();
      handleActivate();
      return;
    }
    if (optionCount < 2 || (key !== 'ArrowUp' && key !== 'ArrowDown')) return;
    event.preventDefault();
    const step = key === 'ArrowUp' ? -1 : 1;
    setSelected((current) => Math.min(Math.max(current + step, 0), optionCount - 1));
  }, [handleActivate, optionCount]);

  return { selected, advanceTick, stageRef, handleActivate, handleKeyDown };
};

export { usePreviewControls };
