/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import type { PositionalSession } from './positional-capture.type';

const usePositionalActions = (session: PositionalSession) => {
  const {
    refs, setItems, setRecords, setActiveIndex, activateIndex, answerActive, setAutoAdvanceWrapped, setInputPhaseActiveWrapped,
  } = session;

  const onStartButtons = useCallback(() => {
    setAutoAdvanceWrapped(true); setInputPhaseActiveWrapped(true);
    activateIndex(0);
  }, [activateIndex, setAutoAdvanceWrapped, setInputPhaseActiveWrapped]);

  const onSkip = useCallback(() => answerActive('skipped', null), [answerActive]);

  const onGoBack = useCallback(() => {
    const idx = refs.activeIndexRef.current;
    if (idx <= 0) return;
    const prevIdx = idx - 1;
    setItems((prev) => prev.map((it, i) => {
      if (i === idx && it.status === 'active') return { ...it, status: 'pending' };
      if (i === prevIdx) return { ...it, status: 'active', result: undefined };
      return it;
    }));
    setRecords((prev) => { const next = [...prev]; delete next[prevIdx]; return next; });
    refs.activeIndexRef.current = prevIdx; setActiveIndex(prevIdx);
    refs.baselineRef.current = refs.latestSampleRef.current;
  }, [refs, setItems, setRecords, setActiveIndex]);

  const onClickItem = useCallback((idx: number) => {
    setAutoAdvanceWrapped(true); setInputPhaseActiveWrapped(true);
    activateIndex(idx);
  }, [activateIndex, setAutoAdvanceWrapped, setInputPhaseActiveWrapped]);

  const onClearItem = useCallback((idx: number) => {
    setRecords((prev) => { const next = [...prev]; delete next[idx]; return next; });
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, status: 'pending', result: undefined } : it)));
  }, [setItems, setRecords]);

  return { onStartButtons, onSkip, onGoBack, onClickItem, onClearItem };
};

export { usePositionalActions };
