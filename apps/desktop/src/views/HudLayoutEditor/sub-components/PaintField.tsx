/* @layer renderer-components @kind component */
import { Box, Field, Flex, IconButton, Select, TextInput } from '@drizztdourden08/tessera/primitives';
import { ColorField } from './ColorField';
import { GradientRamp } from './GradientRamp';
import { ValueField } from './ValueField';
import type { Paint, Value } from '@rotp/hud';
import { ANGLE_STEP } from '../HudLayoutEditor.constants';
import { HEX_RE, KINDS } from './PaintField.constants';
import type { PaintFieldProps, PaintMode } from './PaintField.type';

const modeOf = (paint: Paint): PaintMode => {
  if (typeof paint === 'string') return 'color';
  return 'gradient' in paint ? 'gradient' : 'image';
};

const PaintField = (props: PaintFieldProps) => {
  const { label, value, onChange, scope, insideRepeat, kinds } = props;
  const mode = modeOf(value);
  const showKinds = kinds === true || typeof value !== 'string';
  const hex = typeof value === 'string' && HEX_RE.test(value) ? value : '#000000';

  const setMode = (next: PaintMode): void => {
    if (next === mode) return;
    if (next === 'color') onChange(typeof value === 'string' ? value : hex);
    else if (next === 'gradient') onChange({ gradient: 'linear', angle: 0, stops: [{ at: 0, color: hex }, { at: 1, color: '#000000' }] });
    else onChange({ image: '', size: 'contain' });
  };

  return (
    <Flex direction="column" gap="2xs" className="hud-paint">
      {showKinds && (
        <Field size="sm" label="paint">
          <Box className="hud-icon-choice" role="group" aria-label="paint kind">
            {KINDS.map((kind) => (
              <IconButton
                key={kind.value} variant="ghost" size="sm" title={kind.label} label={kind.label}
                active={mode === kind.value} onClick={() => setMode(kind.value)}
              >{kind.icon}</IconButton>
            ))}
          </Box>
        </Field>
      )}

      {mode === 'color' && (
        <ColorField label={label ?? 'colour'} value={typeof value === 'string' ? value : hex} onChange={onChange} />
      )}

      {mode === 'gradient' && typeof value !== 'string' && 'gradient' in value && (
        <>
          <GradientRamp kind={value.gradient} stops={value.stops} onChange={(stops) => onChange({ ...value, stops })} />
          <ValueField label="angle" value={(value.angle ?? 0) as Value} onChange={(angle) => onChange({ ...value, angle })} scope={scope} insideRepeat={insideRepeat} step={ANGLE_STEP} />
        </>
      )}

      {mode === 'image' && typeof value !== 'string' && 'image' in value && (
        <>
          <Field size="sm" label="file">
            <TextInput size="sm" aria-label="Image file" value={value.image} placeholder="file.png" onChange={(event) => onChange({ ...value, image: event.target.value })} />
          </Field>
          <Field size="sm" label="size">
            <Select size="sm" value={value.size ?? 'contain'} options={[{ value: 'contain', label: 'contain' }, { value: 'cover', label: 'cover' }, { value: 'tile', label: 'tile' }]} onChange={(size) => onChange({ ...value, size: size as 'contain' | 'cover' | 'tile' })} />
          </Field>
          <Field size="sm" label="repeat">
            <Select size="sm" value={value.repeat ?? 'none'} options={[{ value: 'none', label: 'no repeat' }, { value: 'repeat', label: 'repeat' }, { value: 'repeat-x', label: 'repeat-x' }, { value: 'repeat-y', label: 'repeat-y' }]} onChange={(repeat) => onChange({ ...value, repeat: repeat as 'none' | 'repeat' | 'repeat-x' | 'repeat-y' })} />
          </Field>
        </>
      )}
    </Flex>
  );
};

export { PaintField };
export type { PaintFieldProps } from './PaintField.type';
