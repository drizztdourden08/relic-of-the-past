/* @layer renderer-components @kind component */
import { useRef, useState } from 'react';
import { Box, Field, Flex, IconButton, NumberInput, Pressable } from '@drizztdourden08/tessera/primitives';
import { ColorField } from './ColorField';
import { swatchOf } from '@app/hud-layout-editing/appearance-summary';
import './HudLayoutEditor.appearance.css';
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import type { GradientStop } from '@rotp/hud';
import type { GradientRampProps } from './GradientRamp.type';

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));
const round2 = (n: number): number => Math.round(n * 100) / 100;

const GradientRamp = (props: GradientRampProps) => {
  const { stops, onChange, kind } = props;
  const [selected, setSelected] = useState(0);
  const rampRef = useRef<HTMLDivElement>(null);
  const index = Math.min(selected, stops.length - 1);
  const stop = stops[index];

  const commit = (next: GradientStop[], keep: GradientStop): void => {
    const sorted = [...next].sort((a, b) => a.at - b.at);
    setSelected(Math.max(0, sorted.indexOf(keep)));
    onChange(sorted);
  };

  const setStop = (patch: Partial<GradientStop>): void => {
    if (!stop) return;
    const moved = { ...stop, ...patch };
    commit(stops.map((s, i) => (i === index ? moved : s)), moved);
  };

  const atFromEvent = (clientX: number): number => {
    const box = rampRef.current?.getBoundingClientRect();
    return box && box.width > 0 ? round2(clamp01((clientX - box.left) / box.width)) : 0;
  };

  const addStop = (at: number): void => {
    const added: GradientStop = { at, color: stop?.color ?? '#ffffff' };
    commit([...stops, added], added);
  };

  const drag = (event: ReactPointerEvent<HTMLButtonElement>, i: number): void => {
    setSelected(i);
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    const move = (e: PointerEvent): void => {
      const dragged = stops[i];
      if (!dragged) return;
      const moved = { ...dragged, at: atFromEvent(e.clientX) };
      commit(stops.map((s, n) => (n === i ? moved : s)), moved);
    };
    const up = (): void => {
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', up);
    };
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', up);
  };

  const nudge = (event: ReactKeyboardEvent<HTMLButtonElement>): void => {
    const step = event.shiftKey ? 0.1 : 0.01;
    const delta = event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0;
    if (delta === 0 || !stop) return;
    event.preventDefault();
    setStop({ at: round2(clamp01(stop.at + delta)) });
  };

  return (
    <Flex direction="column" gap="2xs" className="hud-ramp">
      <Box
        ref={rampRef}
        className="hud-ramp__track"
        style={{ background: swatchOf({ gradient: kind, angle: 90, stops: [...stops] }) }}
        onDoubleClick={(event) => addStop(atFromEvent(event.clientX))}
      >
        {stops.map((s, i) => (
          <Pressable
            key={i}
            className="hud-ramp__stop"
            aria-label={`Stop ${i + 1} at ${s.at}`}
            aria-pressed={i === index}
            style={{ left: `${s.at * 100}%`, background: s.color }}
            onPointerDown={(event) => drag(event, i)}
            onKeyDown={nudge}
          />
        ))}
      </Box>

      <Flex gap="2xs" align="center" className="hud-ramp__tools">
        <IconButton variant="ghost" size="sm" label="Add a stop" onClick={() => addStop(0.5)}>+</IconButton>
        <IconButton
          variant="ghost" size="sm" label={`Remove stop ${index + 1}`} disabled={stops.length <= 2}
          onClick={() => { const kept = stops.filter((_unused, i) => i !== index); const [first] = kept; if (first) commit(kept, first); }}
        >✕</IconButton>
      </Flex>

      {stop && (
        <ColorField label={`stop ${index + 1}`} value={stop.color} onChange={(color) => setStop({ color })} />
      )}
      {stop && (
        <Field size="sm" label="at">
          <NumberInput
            size="sm" aria-label={`Stop ${index + 1} position`}
            value={stop.at} min={0} max={1} step={0.05}
            onChange={(at) => setStop({ at: Number.isFinite(at) ? clamp01(at) : 0 })}
          />
        </Field>
      )}
    </Flex>
  );
};

export { GradientRamp };
export type { GradientRampProps } from './GradientRamp.type';
