/* @layer renderer-hud @kind logic */
import type { CSSProperties } from 'react';
import type { HudBoxStyle } from '@rotp/hud';
import { animationFilter } from './animation-filter';
import { animationTransform } from './animation-transform';
import type { SampledProperties } from './hud-node-motion.type';

const animationCss = (sampled: SampledProperties, style: HudBoxStyle | undefined, displayScale: number): CSSProperties => {
  const transform = animationTransform(sampled, displayScale);
  const filter = animationFilter(sampled, style);
  return {
    ...(transform ? { transform, transformOrigin: 'center center' } : {}),
    ...(filter ? { filter } : {}),
    ...(sampled.width !== undefined ? { width: sampled.width * displayScale } : {}),
    ...(sampled.height !== undefined ? { height: sampled.height * displayScale } : {}),
  };
};

export { animationCss };
