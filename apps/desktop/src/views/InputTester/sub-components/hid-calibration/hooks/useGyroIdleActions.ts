/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import type { ActionDeps } from './action-deps.type';
import { BYTE_MAX } from '../hid-calibration.constants';
import { findCounterBytes } from '../hid-analysis';
import { DEFAULT_REPORT_LENGTH } from './calibration-actions.constants';

const useGyroIdleActions = (d: ActionDeps) => {
  const handleGyroStart = useCallback(() => {
    const len = d.latestBytes.length || DEFAULT_REPORT_LENGTH;
    d.gyroMinsRef.current = new Uint8Array(len).fill(BYTE_MAX); d.gyroMaxsRef.current = new Uint8Array(len).fill(0); d.gyroBufferRef.current = [];
    d.gyroRecordingRef.current = true; d.setGyroState('recording'); d.setGyroChangedBytes(new Set());
    d.addLog('Gyro recording started. Tilt, rotate and shake the controller...');
  }, [d.latestBytes.length, d.addLog]);

  const handleGyroStop = useCallback(() => {
    d.gyroRecordingRef.current = false; const len = d.gyroMinsRef.current.length; const excl = new Set<number>();
    for (let i = 0; i < len; i++) { if (d.gyroMaxsRef.current[i] !== d.gyroMinsRef.current[i]) excl.add(i); }
    const counters = findCounterBytes(d.gyroBufferRef.current); for (const c of counters) excl.add(c);
    d.excludedRef.current = excl; d.setGyroExcluded(new Set(excl)); d.setGyroState('done');
    d.gyroExcludedBytesRef.current = new Set(excl);
    d.addLog(`OK Gyro done: ${excl.size} bytes excluded (${counters.size} counters, ${excl.size - counters.size} gyro/accel)`);
    d.updateByteStatuses(len);
  }, [d.addLog, d.updateByteStatuses]);

  const handleGyroRedo = useCallback(() => {
    d.setGyroState('idle'); d.setGyroChangedBytes(new Set()); d.excludedRef.current = new Set(); d.setGyroExcluded(new Set());
    d.gyroExcludedBytesRef.current = new Set();
    d.addLog('Gyro data cleared. Ready to re-record.'); if (d.latestBytes.length > 0) d.updateByteStatuses(d.latestBytes.length);
  }, [d.addLog, d.latestBytes.length, d.updateByteStatuses]);

  const handleGyroSkip = useCallback(() => { d.setGyroState('done'); d.gyroExcludedBytesRef.current = new Set(); d.addLog('Gyro profiling skipped.'); }, [d.addLog]);

  const handleIdleCapture = useCallback(() => {
    if (d.latestBytes.length === 0) { d.addLog('Warning: No reports received yet'); return; }
    d.baselineRef.current = new Uint8Array(d.latestBytes); d.setIdleState('done'); d.addLog(`OK Idle baseline captured: ${d.latestBytes.length} bytes`);
  }, [d.latestBytes, d.addLog]);

  const handleIdleRedo = useCallback(() => { d.baselineRef.current = new Uint8Array(0); d.setIdleState('idle'); d.addLog('Idle baseline cleared.'); }, [d.addLog]);

  const ensureBaseline = useCallback((): boolean => {
    if (d.baselineRef.current.length > 0) return true;
    if (d.latestBytes.length === 0) { d.addLog('Warning: No reports received yet. Press nothing and try again.'); return false; }
    d.baselineRef.current = new Uint8Array(d.latestBytes);
    d.setIdleState('done');
    d.addLog(`OK Idle baseline captured automatically: ${d.latestBytes.length} bytes`);
    return true;
  }, [d.latestBytes, d.addLog]);

  return { handleGyroStart, handleGyroStop, handleGyroRedo, handleGyroSkip, handleIdleCapture, handleIdleRedo, ensureBaseline };
};

export { useGyroIdleActions };
