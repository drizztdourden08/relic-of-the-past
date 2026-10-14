/* @layer renderer-hud @kind logic */
import { animationCss } from './animation-css';
import { sampleAll } from './sample-all';
import type { NodeAnimationInput, NodeAnimationResult } from './hud-node-motion.type';

const resolveNodeAnimationStyle = (input: NodeAnimationInput): NodeAnimationResult => {
  const { animations, nowMs, scope, reducedMotion, style, displayScale } = input;
  if (!animations?.length || reducedMotion) return { css: {}, opacityMultiplier: 1 };
  const sampled = sampleAll(animations, nowMs, scope);

  return {
    css: animationCss(sampled, style, displayScale),
    opacityMultiplier: sampled.opacity ?? 1,
  };
};

export { resolveNodeAnimationStyle };
