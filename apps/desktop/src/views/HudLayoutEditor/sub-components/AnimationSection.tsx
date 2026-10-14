/* @layer renderer-components @kind component */
import { Box, Button } from '@drizztdourden08/tessera/primitives';
import { cyclePosition, resolveValue } from '@rotp/hud';
import { useMotionPreview } from '@app/hud-layout-editing/motion-preview';
import { AnimationGroup } from './AnimationGroup';
import { MotionTransport } from './MotionTransport';
import type { HudAnimation } from '@rotp/hud';
import { BLANK } from './AnimationSection.constants';
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

  const removeAnimation = (i: number): void => {
    const rest = animations.filter((_unused, at) => at !== i);
    onPatch({ animation: rest.length > 0 ? rest : undefined });
  };

  return (
    <Box className="hud-inspect__group">
      {animations.length > 0 && <MotionTransport spanMs={spanMs} />}
      {animations.map((animation, i) => {
        const { delay, duration } = msOf(animation, scope);
        return (
          <AnimationGroup
            key={i}
            animation={animation}
            duration={duration}
            head={preview?.nowMs == null ? null : cyclePosition(preview.nowMs, delay, duration, animation.loop)}
            open={openIndex === i}
            onToggle={() => onOpen(openIndex === i ? null : i)}
            onRemove={() => removeAnimation(i)}
            onChange={(patch) => setAnimation(i, patch)}
            scope={scope}
            insideRepeat={insideRepeat}
            warnings={warnings}
          />
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
