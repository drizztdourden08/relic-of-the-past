/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Box, Field, Slider } from '@drizztdourden08/tessera/primitives';
import { addKeyAt, moveKey } from '@app/hud-layout-editing/keyframe-track';
import { EasingPicker } from '../EasingPicker';
import { ValueInput } from '../ValueInput';
import { KeyRail } from './sub-components/KeyRail';
import { KeyTools } from './sub-components/KeyTools';
import type { KeyframeTrackProps } from './KeyframeTrack.type';

const KeyframeTrack = (props: KeyframeTrackProps) => {
  const { keyframes, onChange, scope, insideRepeat, easing, endLabel, head } = props;
  const [rawSelected, setSelected] = useState(0);
  const selected = Math.min(rawSelected, keyframes.length - 1);
  const key = keyframes[selected];

  const move = (index: number, at: number): void => onChange(moveKey(keyframes, index, at));

  const add = (at: number): void => {
    const next = addKeyAt(keyframes, at, scope, easing);
    if (!next) return;
    onChange(next.keyframes);
    setSelected(next.index);
  };

  if (!key) return null;

  return (
    <Box className="hud-kftrack__group">
      <KeyRail
        keyframes={keyframes}
        selected={selected}
        onSelect={setSelected}
        onMove={move}
        onAdd={add}
        head={head}
        endLabel={endLabel}
      />

      <Field size="sm" label={`at · key ${selected + 1} of ${keyframes.length}`}>
        <Slider
          value={key.at}
          min={0}
          max={1}
          step={0.01}
          formatValue={(n) => n.toFixed(2)}
          onChange={(at) => move(selected, at)}
        />
      </Field>

      <ValueInput
        label="value"
        aria-label="Value"
        role="number"
        value={key.value}
        onChange={(value) => onChange(keyframes.map((k, i) => (i === selected ? { ...k, value } : k)))}
        scope={scope}
        insideRepeat={insideRepeat}
      />

      <EasingPicker
        label="ease out"
        allowDefault
        unsetHint="inherits this animation's own easing"
        value={key.easing}
        onChange={(next) => onChange(keyframes.map((k, i) => {
          if (i !== selected) return k;
          const { easing: _dropped, ...rest } = k;
          return next === undefined ? rest : { ...rest, easing: next };
        }))}
      />

      <KeyTools keyframes={keyframes} selected={selected} at={key.at} onAdd={add} onChange={onChange} onSelect={setSelected} />
    </Box>
  );
};

export { KeyframeTrack };
export type { KeyframeTrackProps } from './KeyframeTrack.type';
