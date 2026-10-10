/* @layer shared-types @kind types */
import type { Value } from '../hud-value';

type HudAnimatableProperty = 'scale' | 'opacity' | 'x' | 'y' | 'rotate' | 'tint' | 'width' | 'height';

type HudAnimationLoop = 'none' | 'loop' | 'ping-pong';

type HudNamedEasing = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
type HudEasing = string;

interface HudAnimationKeyframe { at: number; value: Value; easing?: HudEasing }

interface HudAnimation {
  when?: string;
  property: HudAnimatableProperty;
  keyframes: HudAnimationKeyframe[];
  duration: Value;
  delay?: Value;
  loop: HudAnimationLoop;
  easing?: HudEasing;
}

type HudTransitionProperty = 'size' | 'position' | 'opacity' | 'scale' | 'tint' | 'color';

type HudEnterExitProperty = 'opacity' | 'scale' | 'position';

interface HudEnterExitTransition {
  properties: HudEnterExitProperty[];
  duration: Value;
  easing?: HudEasing;
}

interface HudTransition {
  properties: HudTransitionProperty[];
  duration: Value;
  easing?: HudEasing;
  when?: string;
  enter?: HudEnterExitTransition;
  exit?: HudEnterExitTransition;
}

export type {
  HudAnimatableProperty, HudAnimation, HudAnimationKeyframe, HudAnimationLoop, HudEasing, HudEnterExitProperty,
  HudEnterExitTransition, HudNamedEasing, HudTransition, HudTransitionProperty,
};
