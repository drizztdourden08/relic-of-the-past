/* @layer renderer-components @kind hook */
/**
 * Idle-byte recording: samples a fixed set of bytes for 3s and reports
 * per-byte min/max/range/uniques, used by the stick/trigger idle-baseline
 * controls. Split out of useHidCalibration.ts for file-size compliance.
 */
import type React from 'react';
import { useRef, useState } from 'react';
import type { IdleRecordResult } from '../hid-calibration.type';

const useIdleByteRecording = (latestBytesRef: React.MutableRefObject<Uint8Array>, addLog: (msg: string) => void) => {
  const [idleRecording, setIdleRecording] = useState<string | null>(null);
  const [idleResults, setIdleResults] = useState<Record<string, IdleRecordResult>>({});
  const idleRecordBufRef = useRef<{ byteIndices: number[]; frames: number[][] }>({ byteIndices: [], frames: [] });
  const idleRecordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleIdleRecord = (label: string, byteIndices: number[]) => {
    setIdleRecording(label); idleRecordBufRef.current = { byteIndices, frames: [] };
    addLog(`Recording idle bytes [${byteIndices.join(',')}] for ${label}...`);
    const sample = () => { const bytes = latestBytesRef.current; if (bytes.length > 0) idleRecordBufRef.current.frames.push(byteIndices.map(i => bytes[i] ?? 0)); };
    const iv = setInterval(sample, 8);
    idleRecordTimerRef.current = setTimeout(() => {
      clearInterval(iv); const { frames, byteIndices: idxs } = idleRecordBufRef.current;
      if (frames.length === 0) { setIdleRecording(null); return; }
      const analysis = idxs.map((byteIdx, col) => { const values = frames.map(f => f[col]); const min = Math.min(...values), max = Math.max(...values); const unique = [...new Set(values)].sort((a, b) => a - b); const avg = values.reduce((s, v) => s + v, 0) / values.length; return { byteIndex: byteIdx, min, max, range: max - min, average: Math.round(avg), uniqueCount: unique.length, uniqueValues: unique.length <= 32 ? unique : `${unique.length} values` }; });
      const out: IdleRecordResult = { label, durationMs: 3000, frameCount: frames.length, bytes: analysis };
      setIdleResults(prev => ({ ...prev, [label]: out })); navigator.clipboard.writeText(JSON.stringify(out, null, 2));
      addLog(`✓ Idle recorded for ${label}: ${frames.length} frames. Copied to clipboard.`); setIdleRecording(null);
    }, 3000);
  };

  /** Files a reading taken elsewhere, so a step that already sampled these
   *  bytes does not have to sample them a second time. */
  const recordIdleResult = (label: string, result: IdleRecordResult) => {
    setIdleResults(prev => ({ ...prev, [label]: result }));
  };

  return { idleRecording, idleResults, handleIdleRecord, recordIdleResult };
};

export { useIdleByteRecording };
