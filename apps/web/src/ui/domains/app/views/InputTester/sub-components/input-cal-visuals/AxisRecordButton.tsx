/* @layer renderer-components @kind component */
import { useState, useRef, useCallback, useMemo } from 'react';
import { Button, Svg, SvgCircle } from '@drizztdourden08/tessera/primitives';
import { RECORD_DONE_FLASH_MS } from './input-cal-visuals.constants';
import type { AxisRecordButtonProps } from './input-cal-visuals.type';

const AxisRecordButton = ({ getValues, label }: AxisRecordButtonProps) => {
  const [recording, setRecording] = useState(false);
  const [done, setDone] = useState(false);
  const bufRef = useRef<{ t: number; v: number[] }[]>([]);
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
    const data = { label, samples: bufRef.current.length, durationMs: bufRef.current.length > 0 ? bufRef.current[bufRef.current.length - 1].t : 0, values: bufRef.current };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setDone(true);
    setTimeout(() => setDone(false), RECORD_DONE_FLASH_MS);
  }, [label]);

  const color = done ? 'var(--c-secondary-bright)' : recording ? 'var(--c-danger)' : 'var(--c-text-muted)';
  const buttonStyle = useMemo(() => ({
    width: 18, height: 18, padding: 0, border: 'none', borderRadius: 4,
    background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    animation: recording ? 'axis-rec-flash 0.6s ease-in-out infinite' : undefined,
  }), [recording]);

  return (
    <Button
      variant="bare"
      onClick={recording ? stopRecording : startRecording}
      title={recording ? 'Stop recording & copy to clipboard' : `Record ${label} axis data`}
      style={buttonStyle}
    >
      <Svg width="14" height="14" viewBox="0 0 14 14">
        <SvgCircle cx="7" cy="7" r="6" fill="none" stroke={color} strokeWidth="1.5" />
        <SvgCircle cx="7" cy="7" r="3" fill={color} />
      </Svg>
    </Button>
  );
};

export { AxisRecordButton };
