/* @layer renderer-hud @kind logic */
import { tintFilter } from './tint-filter';
import type { HudBoxStyle, Paint } from '@rotp/hud';
import type { SampledProperties } from './hud-node-motion.type';

const flatColor = (paint: Paint | undefined): string => (typeof paint === 'string' ? paint : '#fff');

const animationFilter = (sampled: SampledProperties, style: HudBoxStyle | undefined): string | undefined => {
  if (sampled.tint === undefined) return undefined;
  return tintFilter(flatColor(style?.tint?.color), style?.tint?.mode ?? 'replace', sampled.tint);
};

export { animationFilter };
