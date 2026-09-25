/* @layer renderer-hud @kind logic */
/**
 * One node's `animation` list, sampled at `nowMs` and turned into the CSS this
 * one node's own wrapper needs - THE REFLOW RULE, ENFORCED: every property
 * here is either a `transform` component, a `filter`, an `opacity`
 * MULTIPLIER, or (only for `width`/`height`) an explicit pixel override on
 * this SAME node's own box. None of it is fed back into the placement pass
 * (`shared/hud/engine/measure.ts`/`place.ts` never run again for this) - so
 * the six safe properties structurally cannot move a sibling, and
 * `width`/`height` resize only this node's own rendered box, never a
 * neighbour's position (`validate-motion-warnings.ts` is what tells an
 * author when they reached for one of those two anyway).
 *
 * TINT ANIMATES AN AMOUNT, NOT A COLOUR. `property: 'tint'`'s keyframe values
 * modulate the node's own `style.tint`'s `amount` (0..1) using that SAME
 * tint's `color`/`mode` - replacing `resolve-node-style.ts`'s own static
 * contribution for the duration the gate is true, instead of compounding
 * two tint filters in sequence. A node with an active tint animation but no
 * static `style.tint` gets a plain white `replace` flash, since an author
 * who reaches for "animate tint" with no base tint clearly wants a flash
 * effect and not nothing.
 */
import { sampleAnimation } from '@shared/hud/engine';
import { tintFilter } from '../HudNodeStyle/style-filters';
import type { CSSProperties } from 'react';
import type { HudAnimation, HudBoxStyle, Paint } from '@shared/types/hud';

type Scope = Readonly<Record<string, number>>;

const flatColor = (paint: Paint | undefined): string => (typeof paint === 'string' ? paint : '#fff');

interface SampledProperties {
  scale?: number; x?: number; y?: number; rotate?: number; opacity?: number; tint?: number;
  width?: number; height?: number;
}

const sampleAll = (animations: readonly HudAnimation[], nowMs: number, scope: Scope): SampledProperties => {
  const out: SampledProperties = {};
  animations.forEach((animation) => {
    const value = sampleAnimation(animation, nowMs, scope);
    if (value === undefined) return;
    out[animation.property] = value;
  });
  return out;
};

interface NodeAnimationResult {
  /** `transform`/`filter`/an explicit pixel `width`/`height` override - safe
   *  to spread straight into the wrapper's `style`. */
  css: CSSProperties;
  /** A MULTIPLIER against the node's own placed opacity, never a
   *  replacement - `placed.opacity` already carries ancestor opacity and
   *  dim state, and an `opacity` animation describes its own relative fade
   *  on top of that, the same way its keyframes (1 -> 0.5 -> 1) read as
   *  "half as opaque as usual", not "opacity is now literally 0.5". */
  opacityMultiplier: number;
}

/**
 * @param style the node's own static `HudBoxStyle`, so a `tint` animation
 *              knows what colour/mode to modulate.
 * @param displayScale display px per SNES px - `x`/`y` are authored in the
 *              same SNES-px units every other bound field on the box is.
 */
const resolveNodeAnimationStyle = (
  animations: readonly HudAnimation[] | undefined, nowMs: number, scope: Scope, reducedMotion: boolean,
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
export type { NodeAnimationResult };
