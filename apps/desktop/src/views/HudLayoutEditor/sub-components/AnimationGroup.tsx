/* @layer renderer-components @kind component */
import { Box, Field, Icon, SegmentedControl, Select, Text, Toggle } from '@drizztdourden08/tessera/primitives';
import { EasingPicker } from './EasingPicker';
import { ExpressionInput } from './ExpressionInput';
import { KeyframeTrack } from './KeyframeTrack';
import { SubsectionGroup } from './SubsectionGroup';
import { ValueField } from './ValueField';
import type { HudAnimatableProperty } from '@rotp/hud';
import { MS_STEP } from '../HudLayoutEditor.constants';
import { LOOPS, PROPERTIES, REFLOW } from './AnimationSection.constants';
import type { AnimationGroupProps } from './AnimationGroup.type';
import { useT, useText } from '@drizztdourden08/brock-react';

const AnimationGroup = (props: AnimationGroupProps) => {
  const t = useT();
  const text = useText();
  const { animation, duration, head, open, onToggle, onRemove, onChange, scope, insideRepeat, warnings } = props;
  const reflow = warnings.find((w) => w.property === animation.property);

  return (
    <SubsectionGroup
      title={animation.property}
      summary={`${duration}ms · ${animation.loop}${animation.when !== undefined ? ` · ${t('hud-editor:animation-group.gated')}` : ''}`}
      open={open}
      onToggle={onToggle}
      action={{ label: t('hud-editor:animation-group.remove', { property: animation.property }), icon: '✕', onClick: onRemove }}
    >
      <Field size="sm" label={t('hud-editor:animation-group.label.property')}>
        <Select
          size="sm"
          value={animation.property}
          options={PROPERTIES.map((p) => ({ value: p, label: p }))}
          onChange={(property) => onChange({ property: property as HudAnimatableProperty })}
        />
      </Field>
      {(reflow !== undefined || REFLOW.has(animation.property)) && (
        <Text className="hud-inspect__warning"><Icon name="triangle-alert" size={14} aria-hidden /> {t('hud-editor:animation-group.reflow')}</Text>
      )}

      <KeyframeTrack
        keyframes={animation.keyframes}
        onChange={(keyframes) => onChange({ keyframes })}
        scope={scope}
        insideRepeat={insideRepeat}
        easing={animation.easing}
        endLabel={`${duration}ms`}
        head={head}
      />

      <Box className="hud-inspect__row">
        <ValueField label={t('hud-editor:animation-group.label.duration-ms')} value={animation.duration} onChange={(next) => onChange({ duration: next })} scope={scope} insideRepeat={insideRepeat} min={0} step={MS_STEP} />
        <ValueField label={t('hud-editor:animation-group.label.delay-ms')} value={animation.delay ?? 0} onChange={(next) => onChange({ delay: next === 0 ? undefined : next })} scope={scope} insideRepeat={insideRepeat} step={MS_STEP} />
      </Box>
      <Field size="sm" label={t('hud-editor:animation-group.label.loop')}>
        <SegmentedControl size="sm" value={animation.loop} options={LOOPS.map((loop) => ({ value: loop.value, label: text(loop.label) }))} onChange={(loop) => onChange({ loop })} />
      </Field>
      <EasingPicker label={t('hud-editor:animation-group.label.easing')} value={animation.easing} onChange={(easing) => onChange({ easing })} />

      <Toggle size="sm" checked={animation.when !== undefined} label={t('hud-editor:animation-group.label.only-when')} onChange={(on) => onChange({ when: on ? '1' : undefined })} />
      {animation.when !== undefined && (
        <ExpressionInput value={animation.when} onChange={(when) => onChange({ when })} scope={scope} insideRepeat={insideRepeat} aria-label={t('hud-editor:animation-group.aria.animation-gate')} />
      )}
    </SubsectionGroup>
  );
};

export { AnimationGroup };
