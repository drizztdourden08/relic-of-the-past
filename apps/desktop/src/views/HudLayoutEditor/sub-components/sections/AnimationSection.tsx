/* @layer renderer-components @kind component */
import { Box, Button, Field, SegmentedControl, Select, Text, Toggle } from '@drizztdourden08/tessera/primitives';
import { cyclePosition, resolveValue } from '@rotp/hud';
import { useMotionPreview } from '../../behavior/motion-preview';
import { EasingPicker } from '../EasingPicker';
import { ExpressionInput } from '../ExpressionInput';
import { KeyframeTrack } from '../KeyframeTrack';
import { MotionTransport } from '../MotionTransport';
import { SubsectionGroup } from '../SubsectionGroup';
import { ValueField } from '../ValueField';
import type { HudAnimatableProperty, HudAnimation, HudAnimationLoop } from '@rotp/hud';
import { MS_STEP } from '../../HudLayoutEditor.constants';
import { BLANK, LOOPS, PROPERTIES, REFLOW } from './AnimationSection.constants';
import type { AnimationSectionProps } from './AnimationSection.type';

const msOf = (animation: HudAnimation, scope: Readonly<Record<string, number>>): { delay: number; duration: number } => ({
  delay: animation.delay === undefined ? 0 : resolveValue(animation.delay, scope),
  duration: resolveValue(animation.duration, scope),
});

const AnimationSection = (props: AnimationSectionProps) => {
  const { node, onPatch, scope, insideRepeat, warnings, openIndex, onOpen } = props;
  const animations = node.animation ?? [];
  const preview = useMotionPreview();
  const spanMs = animations.reduce((longest, a) => {
    const { delay, duration } = msOf(a, scope);
    return Math.max(longest, delay + duration);
  }, 1);

  const setAnimation = (i: number, patch: Partial<HudAnimation>): void => {
    onPatch({ animation: animations.map((a, at) => (at === i ? { ...a, ...patch } : a)) });
  };

  return (
    <Box className="hud-inspect__group">
      {animations.length > 0 && <MotionTransport spanMs={spanMs} />}
      {animations.map((animation, i) => {
        const { delay, duration } = msOf(animation, scope);
        const head = preview?.nowMs == null ? null : cyclePosition(preview.nowMs, delay, duration, animation.loop);
        const reflow = warnings.find((w) => w.includes(`animating '${animation.property}'`));
        return (
          <SubsectionGroup
            key={i}
            title={animation.property}
            summary={`${duration}ms · ${animation.loop}${animation.when !== undefined ? ' · gated' : ''}`}
            open={openIndex === i}
            onToggle={() => onOpen(openIndex === i ? null : i)}
            action={{
              label: `Remove the ${animation.property} animation`,
              icon: '✕',
              onClick: () => { const rest = animations.filter((_unused, at) => at !== i); onPatch({ animation: rest.length > 0 ? rest : undefined }); },
            }}
          >
            <Field size="sm" label="property">
              <Select
                size="sm"
                value={animation.property}
                options={PROPERTIES.map((p) => ({ value: p, label: p }))}
                onChange={(property) => setAnimation(i, { property: property as HudAnimatableProperty })}
              />
            </Field>
            {reflow !== undefined
              ? <Text className="hud-inspect__warning">⚠ {reflow}</Text>
              : REFLOW.has(animation.property) && (
                <Text className="hud-inspect__warning">⚠ width and height can reflow siblings. The other six properties never can.</Text>
              )}

            <KeyframeTrack
              keyframes={animation.keyframes}
              onChange={(keyframes) => setAnimation(i, { keyframes })}
              scope={scope}
              insideRepeat={insideRepeat}
              easing={animation.easing}
              endLabel={`${duration}ms`}
              head={head}
            />

            <Box className="hud-inspect__row">
              <ValueField label="duration (ms)" value={animation.duration} onChange={(next) => setAnimation(i, { duration: next })} scope={scope} insideRepeat={insideRepeat} min={0} step={MS_STEP} />
              <ValueField label="delay (ms)" value={animation.delay ?? 0} onChange={(next) => setAnimation(i, { delay: next === 0 ? undefined : next })} scope={scope} insideRepeat={insideRepeat} step={MS_STEP} />
            </Box>
            <Field size="sm" label="loop">
              <SegmentedControl size="sm" value={animation.loop} options={[...LOOPS]} onChange={(loop) => setAnimation(i, { loop: loop as HudAnimationLoop })} />
            </Field>
            <EasingPicker label="easing" value={animation.easing} onChange={(easing) => setAnimation(i, { easing })} />

            <Toggle size="sm" checked={animation.when !== undefined} label="only when" onChange={(on) => setAnimation(i, { when: on ? '1' : undefined })} />
            {animation.when !== undefined && (
              <ExpressionInput value={animation.when} onChange={(when) => setAnimation(i, { when })} scope={scope} insideRepeat={insideRepeat} aria-label="Animation gate" />
            )}
          </SubsectionGroup>
        );
      })}
      <Button variant="ghost" size="sm" onClick={() => { onPatch({ animation: [...animations, BLANK] }); onOpen(animations.length); }}>
        + add animation
      </Button>
    </Box>
  );
};

export { AnimationSection };
export type { AnimationSectionProps } from './AnimationSection.type';
