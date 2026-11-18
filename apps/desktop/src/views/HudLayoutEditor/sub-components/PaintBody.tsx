/* @layer renderer-components @kind component */
import { Field, Select, TextInput } from '@drizztdourden08/tessera/primitives';
import { ColorField } from './ColorField';
import { GradientRamp } from './GradientRamp';
import { ValueField } from './ValueField';
import { ANGLE_STEP } from '../HudLayoutEditor.constants';
import type { PaintBodyProps } from './PaintBody.type';
import { useT } from '@drizztdourden08/brock-react';

const PaintBody = (props: PaintBodyProps) => {
  const t = useT();
  const { label, value, onChange, scope, insideRepeat } = props;

  if (typeof value === 'string') {
    return <ColorField label={label ?? 'colour'} value={value} onChange={onChange} />;
  }

  if ('gradient' in value) {
    return (
      <>
        <GradientRamp kind={value.gradient} stops={value.stops} onChange={(stops) => onChange({ ...value, stops })} />
        <ValueField label={t('hud-editor:paint-body.label.angle')} value={(value.angle ?? 0)} onChange={(angle) => onChange({ ...value, angle })} scope={scope} insideRepeat={insideRepeat} step={ANGLE_STEP} />
      </>
    );
  }

  return (
    <>
      <Field size="sm" label={t('hud-editor:paint-body.label.file')}>
        <TextInput size="sm" aria-label={t('hud-editor:paint-body.aria.image-file')} value={value.image} placeholder={t('hud-editor:paint-body.placeholder.file-png')} onChange={(event) => onChange({ ...value, image: event.target.value })} />
      </Field>
      <Field size="sm" label={t('hud-editor:paint-body.label.size')}>
        <Select size="sm" value={value.size ?? 'contain'} options={[{ value: 'contain', label: t('hud-editor:paint.size.contain') }, { value: 'cover', label: t('hud-editor:paint.size.cover') }, { value: 'tile', label: t('hud-editor:paint.size.tile') }]} onChange={(size) => onChange({ ...value, size: size as 'contain' | 'cover' | 'tile' })} />
      </Field>
      <Field size="sm" label={t('hud-editor:paint-body.label.repeat')}>
        <Select size="sm" value={value.repeat ?? 'none'} options={[{ value: 'none', label: t('hud-editor:paint.repeat.none') }, { value: 'repeat', label: t('hud-editor:paint.repeat.both') }, { value: 'repeat-x', label: t('hud-editor:paint.repeat.x') }, { value: 'repeat-y', label: t('hud-editor:paint.repeat.y') }]} onChange={(repeat) => onChange({ ...value, repeat: repeat as 'none' | 'repeat' | 'repeat-x' | 'repeat-y' })} />
      </Field>
    </>
  );
};

export { PaintBody };
