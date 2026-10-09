/* @layer shared-hud @kind constants */
import type {
  HudAnimatableProperty, HudAnimationLoop, HudEnterExitProperty, HudTransitionProperty,
} from '../../../types/hud/hud-motion';

const ANIMATABLE_PROPERTIES: readonly HudAnimatableProperty[] = [
  'scale', 'opacity', 'x', 'y', 'rotate', 'tint', 'width', 'height',
];
const LOOPS: readonly HudAnimationLoop[] = ['none', 'loop', 'ping-pong'];
const TRANSITION_PROPERTIES: readonly HudTransitionProperty[] = ['size', 'position', 'opacity', 'scale', 'tint', 'color'];
const ENTER_EXIT_PROPERTIES: readonly HudEnterExitProperty[] = ['opacity', 'scale', 'position'];

const NAMED_EASINGS = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'] as const;
const STEPS_AT_LEAST_ONE_RE = /^steps\([1-9]\d*\)$/;

const ANIMATION_KEYS = ['when', 'property', 'keyframes', 'duration', 'delay', 'loop', 'easing'] as const;
const TRANSITION_KEYS = ['properties', 'duration', 'easing', 'when', 'enter', 'exit'] as const;
const TRANSITION_ONLY_NAMES: readonly string[] = ['delta'];

export {
  ANIMATABLE_PROPERTIES, ANIMATION_KEYS, ENTER_EXIT_PROPERTIES, LOOPS, NAMED_EASINGS, STEPS_AT_LEAST_ONE_RE,
  TRANSITION_KEYS, TRANSITION_ONLY_NAMES, TRANSITION_PROPERTIES,
};
