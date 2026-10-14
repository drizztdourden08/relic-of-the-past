/* @layer renderer-hud @kind logic */
import type { SampledProperties } from './hud-node-motion.type';

const animationTransform = (sampled: SampledProperties, displayScale: number): string | undefined => {
  const parts: string[] = [];
  if (sampled.x !== undefined || sampled.y !== undefined) {
    parts.push(`translate(${(sampled.x ?? 0) * displayScale}px, ${(sampled.y ?? 0) * displayScale}px)`);
  }
  if (sampled.scale !== undefined) parts.push(`scale(${sampled.scale})`);
  if (sampled.rotate !== undefined) parts.push(`rotate(${sampled.rotate}deg)`);
  return parts.length ? parts.join(' ') : undefined;
};

export { animationTransform };
