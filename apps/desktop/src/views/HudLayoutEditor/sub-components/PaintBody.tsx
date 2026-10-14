/* @layer renderer-components @kind component */
import { Field, Select, TextInput } from '@drizztdourden08/tessera/primitives';
import { ColorField } from './ColorField';
import { GradientRamp } from './GradientRamp';
import { ValueField } from './ValueField';
import { ANGLE_STEP } from '../HudLayoutEditor.constants';
import type { PaintBodyProps } from './PaintBody.type';

const PaintBody = (props: PaintBodyProps) => {
  const { label, value, onChange, scope, insideRepeat } = props;

  if (typeof value === 'string') {
    return <ColorField label={label ?? 'colour'} value={value} onChange={onChange} />;
  }

  if ('gradient' in value) {
    return (
      <>
        <GradientRamp kind={value.gradient} stops={value.stops} onChange={(stops) => onChange({ ...value, stops })} />
        <ValueField label="angle" value={(value.angle ?? 0)} onChange={(angle) => onChange({ ...value, angle })} scope={scope} insideRepeat={insideRepeat} step={ANGLE_STEP} />
      </>
    );
  }

  return (
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
  );
};

export { PaintBody };
