/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import type { ActionDeps } from './action-deps.type';
import { STICK_IDS, TRIGGER_IDS } from '../hid-calibration.constants';
import { isAnalogItem } from './is-analog-item';

const useItemActions = (d: ActionDeps, ensureBaseline: () => boolean) => {
  const handleStartButtons = useCallback(() => {
    if (!ensureBaseline()) return;
    const firstIdx = d.itemsRef.current.findIndex((it) => it.status !== 'captured' && it.status !== 'skipped' && !STICK_IDS.has(it.id) && !TRIGGER_IDS.has(it.id));
    if (firstIdx < 0) { d.addLog('All inputs already mapped.'); return; }
    d.setActiveIndex(firstIdx); d.setCaptureState('waiting-press'); d.setAxisSubStep('pos'); d.setAutoAdvanceWrapped(true); d.setInputPhaseActiveWrapped(true);
    d.awaitingButtonRestRef.current = true;
    d.setItems(prev => prev.map((it, i) => i === firstIdx ? { ...it, status: 'active' } : it));
    d.addLog('Auto-advance started. Press each input once when prompted.');
  }, [d.addLog, ensureBaseline]);

  const handleClearItem = useCallback((idx: number) => {
    const item = d.itemsRef.current[idx]; if (!item) return;
    d.setItems(prev => prev.map((it, i) => i === idx ? { ...it, status: 'pending', result: undefined, mapping: undefined, axisMapping: undefined } : it));
    d.addLog(`Cleared: ${item.label}`); if (d.latestBytes.length > 0) d.updateByteStatuses(d.latestBytes.length);
  }, [d.addLog, d.latestBytes.length, d.updateByteStatuses]);

  const handleSkip = useCallback(() => { d.setItems(prev => prev.map((it, i) => i === d.activeIdxRef.current ? { ...it, status: 'skipped', result: 'skipped' } : it)); d.setAxisSubStep('pos'); d.doAdvance(); }, [d.doAdvance]);

  const handleGoBack = useCallback(() => {
    if (d.activeIdxRef.current <= 0) return;
    if (d.advanceTimerRef.current) { clearTimeout(d.advanceTimerRef.current); d.advanceTimerRef.current = null; }
    let prevIdx = d.activeIdxRef.current - 1;
    while (prevIdx >= 0 && isAnalogItem(d.itemsRef.current[prevIdx])) prevIdx--;
    if (prevIdx < 0) return;
    d.setItems(prev => prev.map((it, i) => { if (i === d.activeIdxRef.current && it.status !== 'captured') return { ...it, status: 'pending' }; if (i === prevIdx) return { ...it, status: 'active', result: undefined, mapping: undefined, axisMapping: undefined }; return it; }));
    d.setActiveIndex(prevIdx); d.setCaptureState('waiting-press'); d.setAxisSubStep('pos'); d.releaseCountRef.current = 0; d.confirmCountRef.current = 0; d.detectedBtnRef.current = null; d.awaitingButtonRestRef.current = true;
    d.addLog(`Back to: ${d.itemsRef.current[prevIdx]?.label}`);
  }, [d.addLog]);

  const handleClickItem = useCallback((idx: number) => {
    const item = d.itemsRef.current[idx]; if (!item || STICK_IDS.has(item.id) || TRIGGER_IDS.has(item.id)) return;
    if (!ensureBaseline()) return;
    if (d.advanceTimerRef.current) { clearTimeout(d.advanceTimerRef.current); d.advanceTimerRef.current = null; }
    d.setItems(prev => prev.map((it, i) => { if (i === d.activeIdxRef.current && it.status === 'active') return { ...it, status: 'pending' }; if (i === idx && it.status !== 'captured') return { ...it, status: 'active' }; return it; }));
    d.setActiveIndex(idx); d.setCaptureState('waiting-press'); d.setAxisSubStep('pos'); d.releaseCountRef.current = 0; d.confirmCountRef.current = 0; d.detectedBtnRef.current = null; d.awaitingButtonRestRef.current = true;
    if (!d.inputPhaseActiveRef.current) { d.setAutoAdvanceWrapped(false); d.setInputPhaseActiveWrapped(true); }
    d.addLog(`Next: ${item.label}`);
  }, [d.addLog, ensureBaseline]);

  return { handleStartButtons, handleClearItem, handleSkip, handleGoBack, handleClickItem };
};

export { useItemActions };
