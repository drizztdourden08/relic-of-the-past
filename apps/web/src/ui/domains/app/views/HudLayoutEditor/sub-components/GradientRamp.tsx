/* @layer renderer-components @kind component */
/**
 * THE RAMP IS THE THING BEING EDITED, SO THE RAMP IS DRAWN.
 *
 * What it replaces: two stops as two rows of `position + swatch + clipped hex +
 * ✕`, with nothing anywhere rendering the gradient. A fourth stop cost a fourth
 * row and you still could not see it. Every tool that edits gradients (Figma,
 * Photoshop, devtools, Blender's colour ramp) draws the ramp and puts the
 * stops on it, because a gradient is a picture and a list of numbers is not.
 *
 * ONLY THE SELECTED STOP OCCUPIES ROWS. `n` stops cost one ramp plus two rows,
 * whatever `n` is; the old shape cost `n` rows and never showed the result.
 *
 * THREE GESTURES, AND A KEYBOARD PATH FOR EACH. Click selects, drag moves,
 * double-click on the ramp adds a stop where you clicked. Drag is the one a
 * keyboard cannot reach, so the arrow keys nudge the focused stop by 1% (10%
 * with shift) and `at` is also a plain number field beneath. That is the same value,
 * twice, because dragging is for feel and typing is for `0.5` exactly.
 *
 * STOPS ARE SORTED ON EVERY WRITE, and selection follows the moved stop instead
 * of the index, so dragging one past another does not silently start editing
 * its neighbour. `at` is a bare `number` in `hud-value.ts` and not a `Value`,
 * so this is a `NumberInput` and not a `ValueInput`; a stop position is not
 * bindable in the document model and the field must not pretend it is.
 */
import { useRef, useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { IconButton } from '@ds/primitives/IconButton';
import { NumberInput } from '@ds/primitives/NumberInput';
import { ColorField } from './ColorField';
import { swatchOf } from '../behavior/appearance-summary';
import './HudLayoutEditor.appearance.css';
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import type { GradientStop } from '@shared/types/hud';

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));
const round2 = (n: number): number => Math.round(n * 100) / 100;

interface GradientRampProps {
  stops: readonly GradientStop[];
  onChange: (next: GradientStop[]) => void;
  kind: 'linear' | 'radial';
}

const GradientRamp = (props: GradientRampProps) => {
  const { stops, onChange, kind } = props;
  const [selected, setSelected] = useState(0);
  const rampRef = useRef<HTMLDivElement>(null);
  const index = Math.min(selected, stops.length - 1);
  const stop = stops[index];

  /** Sorted on write, and the selection re-found by identity afterwards. */
  const commit = (next: GradientStop[], keep: GradientStop): void => {
    const sorted = [...next].sort((a, b) => a.at - b.at);
    setSelected(Math.max(0, sorted.indexOf(keep)));
    onChange(sorted);
  };

  const setStop = (patch: Partial<GradientStop>): void => {
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
      const at = atFromEvent(e.clientX);
      const moved = { ...stops[i], at };
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
    if (delta === 0) return;
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
          <Button
            key={i}
            variant="bare"
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
          onClick={() => { const kept = stops.filter((_unused, i) => i !== index); commit(kept, kept[0]); }}
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
export type { GradientRampProps };
