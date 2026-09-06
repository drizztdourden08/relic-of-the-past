/* @layer renderer-components @kind hook */
/**
 * The preview's input surface: one focusable stage that advances on click,
 * Space or Enter, and moves a choice cursor with the arrow keys.
 *
 * The stage is focused as soon as the preview mounts, so the keys work the
 * moment the mode opens without a click first. Activation restarts instead of
 * advancing once the last box is showing, and only a real advance bumps
 * `advanceTick`, which is the counter the box's scroll animation is keyed on, so
 * a restart snaps back to the first box with no motion.
 *
 * The selection cursor is 0-based over the current box's option rows and is
 * reset by every activation: the next box is a different prompt (or none), so
 * a stale selection would point at nothing.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

type PreviewControlsParams = {
  /** The last box is showing, so activation restarts instead of advancing. */
  atEnd: boolean;
  /** Option rows on the current box; zero when it is not a choice prompt. */
  optionCount: number;
  onAdvance: () => void;
  onRestart: () => void;
};

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
export type { PreviewControlsParams };
