/* @layer renderer-hud @kind logic */
import { sampleAnimation } from '@rotp/hud';
import { tintFilter } from '../HudNodeStyle/tint-filter';
import type { HudAnimation, HudBoxStyle, Paint } from '@rotp/hud';
import type { MotionScope, NodeAnimationResult, SampledProperties } from './HudNodeMotion.type';

const flatColor = (paint: Paint | undefined): string => (typeof paint === 'string' ? paint : '#fff');

const sampleAll = (animations: readonly HudAnimation[], nowMs: number, scope: MotionScope): SampledProperties => {
  const out: SampledProperties = {};
  animations.forEach((animation) => {
    const value = sampleAnimation(animation, nowMs, scope);
    if (value === undefined) return;
    out[animation.property] = value;
  });
  return out;
};

const resolveNodeAnimationStyle = (
  animations: readonly HudAnimation[] | undefined, nowMs: number, scope: MotionScope, reducedMotion: boolean,
  style: HudBoxStyle | undefined, displayScale: number,
): NodeAnimationResult => {
  if (!animations?.length || reducedMotion) return { css: {}, opacityMultiplier: 1 };
  const sampled = sampleAll(animations, nowMs, scope);

  const transforms: string[] = [];
  if (sampled.x !== undefined || sampled.y !== undefined) {
    transforms.push(`translate(${(sampled.x ?? 0) * displayScale}px, ${(sampled.y ?? 0) * displayScale}px)`);
  }
  if (sampled.scale !== undefined) transforms.push(`scale(${sampled.scale})`);
  if (sampled.rotate !== undefined) transforms.push(`rotate(${sampled.rotate}deg)`);

  const filter = sampled.tint !== undefined
    ? tintFilter(flatColor(style?.tint?.color), style?.tint?.mode ?? 'replace', sampled.tint)
    : undefined;

  return {
    css: {
      ...(transforms.length ? { transform: transforms.join(' '), transformOrigin: 'center center' } : {}),
      ...(filter ? { filter } : {}),
      ...(sampled.width !== undefined ? { width: sampled.width * displayScale } : {}),
      ...(sampled.height !== undefined ? { height: sampled.height * displayScale } : {}),
    },
    opacityMultiplier: sampled.opacity ?? 1,
  };
};

export { resolveNodeAnimationStyle };
