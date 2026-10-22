/* @layer renderer-components @kind component */
import { useState, useRef, useCallback } from 'react';
import { Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import { RECORD_DONE_FLASH_MS } from './input-cal-visuals.constants';
import type { AxisRecordButtonProps, AxisSample } from './input-cal-visuals.type';

const AxisRecordButton = ({ getValues, label }: AxisRecordButtonProps) => {
  const [recording, setRecording] = useState(false);
  const [done, setDone] = useState(false);
  const bufRef = useRef<AxisSample[]>([]);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const getValRef = useRef(getValues);
  getValRef.current = getValues;

  const startRecording = useCallback(() => {
    bufRef.current = [];
    startRef.current = performance.now();
    setRecording(true);
    setDone(false);
    const sample = () => {
      bufRef.current.push({ t: Math.round(performance.now() - startRef.current), v: getValRef.current() });
      rafRef.current = requestAnimationFrame(sample);
    };
    rafRef.current = requestAnimationFrame(sample);
  }, []);

  const stopRecording = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setRecording(false);
    const samples = bufRef.current;
    const data = { label, samples: samples.length, durationMs: samples.at(-1)?.t ?? 0, values: samples };
    void navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setDone(true);
    setTimeout(() => setDone(false), RECORD_DONE_FLASH_MS);
  }, [label]);

  return (
    <IconButton
      variant="ghost"
      size="xs"
      tone={recording ? 'danger' : undefined}
      active={recording}
      onClick={recording ? stopRecording : startRecording}
      label={recording ? 'Stop recording & copy to clipboard' : `Record ${label} axis data`}
    >
      <Icon name={done ? 'check' : 'circle-dot'} />
    </IconButton>
  );
};

export { AxisRecordButton };
