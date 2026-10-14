/* @layer renderer-components @kind component */
import { useRef } from 'react';
import { Box, Pressable } from '@drizztdourden08/tessera/primitives';
import { swatchOf } from '@app/hud-layout-editing/appearance-summary';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { RampTrackProps } from './RampTrack.type';

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));
const round2 = (n: number): number => Math.round(n * 100) / 100;

const RampTrack = (props: RampTrackProps) => {
  const { stops, kind, index, onSelect, onCommit, onAddAt, onNudge } = props;
  const rampRef = useRef<HTMLDivElement>(null);

  const atFromEvent = (clientX: number): number => {
    const box = rampRef.current?.getBoundingClientRect();
    return box && box.width > 0 ? round2(clamp01((clientX - box.left) / box.width)) : 0;
  };

  const drag = (event: ReactPointerEvent<HTMLButtonElement>, i: number): void => {
    onSelect(i);
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    const move = (e: PointerEvent): void => {
      const dragged = stops[i];
      if (!dragged) return;
      const moved = { ...dragged, at: atFromEvent(e.clientX) };
      onCommit(stops.map((s, n) => (n === i ? moved : s)), moved);
    };
    const up = (): void => {
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', up);
    };
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', up);
  };

  return (
    <Box
      ref={rampRef}
      className="hud-ramp__track"
      style={{ background: swatchOf({ gradient: kind, angle: 90, stops: [...stops] }) }}
      onDoubleClick={(event) => onAddAt(atFromEvent(event.clientX))}
    >
      {stops.map((s, i) => (
        <Pressable
          key={i}
          className="hud-ramp__stop"
          aria-label={`Stop ${i + 1} at ${s.at}`}
          aria-pressed={i === index}
          style={{ left: `${s.at * 100}%`, background: s.color }}
          onPointerDown={(event) => drag(event, i)}
          onKeyDown={onNudge}
        />
      ))}
    </Box>
  );
};

export { RampTrack };
