/* @layer renderer-components @kind hook */
import type React from 'react';
import { useRef, useState } from 'react';
import type { IdleByteAnalysis, IdleRecordResult } from '../hid-calibration.type';
import { IDLE_RECORD_MS, IDLE_SAMPLE_INTERVAL_MS, MAX_LISTED_UNIQUE_VALUES } from './idle-byte-recording.constants';

const analyseColumn = (frames: number[][], byteIdx: number, col: number): IdleByteAnalysis => {
  const values = frames.map(f => f[col] ?? 0);
  const min = Math.min(...values), max = Math.max(...values);
  const unique = [...new Set(values)].sort((a, b) => a - b);
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  return {
    byteIndex: byteIdx, min, max, range: max - min, average: Math.round(avg), uniqueCount: unique.length,
    uniqueValues: unique.length <= MAX_LISTED_UNIQUE_VALUES ? unique : `${unique.length} values`,
  };
};

const useIdleByteRecording = (latestBytesRef: React.RefObject<Uint8Array>, addLog: (msg: string) => void) => {
  const [idleRecording, setIdleRecording] = useState<string | null>(null);
  const [idleResults, setIdleResults] = useState<Record<string, IdleRecordResult>>({});
  const idleRecordBufRef = useRef<{ byteIndices: number[]; frames: number[][] }>({ byteIndices: [], frames: [] });
  const idleRecordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleIdleRecord = (label: string, byteIndices: number[]) => {
    setIdleRecording(label); idleRecordBufRef.current = { byteIndices, frames: [] };
    addLog(`Recording idle bytes [${byteIndices.join(',')}] for ${label}...`);
    const sample = () => { const bytes = latestBytesRef.current; if (bytes.length > 0) idleRecordBufRef.current.frames.push(byteIndices.map(i => bytes[i] ?? 0)); };
    const iv = setInterval(sample, IDLE_SAMPLE_INTERVAL_MS);
    idleRecordTimerRef.current = setTimeout(() => {
      clearInterval(iv); const { frames, byteIndices: idxs } = idleRecordBufRef.current;
      if (frames.length === 0) { setIdleRecording(null); return; }
      const analysis = idxs.map((byteIdx, col) => analyseColumn(frames, byteIdx, col));
      const out: IdleRecordResult = { label, durationMs: IDLE_RECORD_MS, frameCount: frames.length, bytes: analysis };
      setIdleResults(prev => ({ ...prev, [label]: out })); void navigator.clipboard.writeText(JSON.stringify(out, null, 2));
      addLog(`OK Idle recorded for ${label}: ${frames.length} frames. Copied to clipboard.`); setIdleRecording(null);
    }, IDLE_RECORD_MS);
  };

  const recordIdleResult = (label: string, result: IdleRecordResult) => {
    setIdleResults(prev => ({ ...prev, [label]: result }));
  };

  return { idleRecording, idleResults, handleIdleRecord, recordIdleResult };
};

export { useIdleByteRecording };
