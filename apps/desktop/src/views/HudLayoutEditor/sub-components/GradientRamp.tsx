/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Field, Flex, IconButton, NumberInput } from '@drizztdourden08/tessera/primitives';
import { ColorField } from './ColorField';
import { RampTrack } from './RampTrack';
import { HUD_WHITE } from '../HudLayoutEditor.constants';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { GradientStop } from '@rotp/hud';
import { NUDGE_FINE, NUDGE_COARSE, NUDGE_KEYS } from './GradientRamp.constants';
import type { GradientRampProps } from './GradientRamp.type';

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));
const round2 = (n: number): number => Math.round(n * 100) / 100;

const GradientRamp = (props: GradientRampProps) => {
  const { stops, onChange, kind } = props;
  const [selected, setSelected] = useState(0);
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

  const addStop = (at: number): void => {
    const added: GradientStop = { at, color: stop?.color ?? HUD_WHITE };
    commit([...stops, added], added);
  };

  const nudge = (event: ReactKeyboardEvent<HTMLButtonElement>): void => {
    const delta = (NUDGE_KEYS[event.key] ?? 0) * (event.shiftKey ? NUDGE_COARSE : NUDGE_FINE);
    if (delta === 0 || !stop) return;
    event.preventDefault();
    setStop({ at: round2(clamp01(stop.at + delta)) });
  };

  const removeSelected = (): void => {
    const kept = stops.filter((_unused, i) => i !== index);
    const [first] = kept;
    if (first) commit(kept, first);
  };

  return (
    <Flex direction="column" gap="2xs" className="hud-ramp">
      <RampTrack stops={stops} kind={kind} index={index} onSelect={setSelected} onCommit={commit} onAddAt={addStop} onNudge={nudge} />

      <Flex gap="2xs" align="center" className="hud-ramp__tools">
        <IconButton variant="ghost" size="sm" label="Add a stop" onClick={() => addStop(0.5)}>+</IconButton>
        <IconButton variant="ghost" size="sm" label={`Remove stop ${index + 1}`} disabled={stops.length <= 2} onClick={removeSelected}>✕</IconButton>
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
