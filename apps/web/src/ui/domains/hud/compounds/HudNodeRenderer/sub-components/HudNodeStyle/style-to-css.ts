/* @layer renderer-hud @kind logic */
/**
 * The CSS-grade half of `HudBoxStyle`: `background`, `border`, `radius`,
 * `shadow`, `clip` translate directly into CSS with no special technique -
 * `outline` and `tint` do not, and live in `style-filters.ts` beside this.
 *
 * Every numeric field is a `Value`, resolved against the same data scope the
 * engine resolves `size`/`scale`/`opacity` against - `resolve-value.ts` is the
 * one seam, used here exactly as it is in `shared/hud/engine/resolve-box.ts`.
 */

import { resolveValue } from '@shared/hud/data';
import type { CSSProperties } from 'react';
import type {
  HudBorder, HudBoxStyle, HudRadius, HudShadow,
} from '@shared/types/hud';
import type { Paint } from '@shared/types/hud';

type Scope = Readonly<Record<string, number>>;

const num = (value: Parameters<typeof resolveValue>[0], scope: Scope): number => resolveValue(value, scope);

/** A flat colour, a gradient, or an image - the CSS value alone, never the
 *  repeat/size keywords an image paint also carries (the caller sets those). */
const paintToCss = (paint: Paint | undefined, scope: Scope): string | undefined => {
  if (paint === undefined) return undefined;
  if (typeof paint === 'string') return paint;
  if ('gradient' in paint) {
    const stops = paint.stops.map((stop) => `${stop.color} ${stop.at * 100}%`).join(', ');
    if (paint.gradient === 'linear') return `linear-gradient(${num(paint.angle ?? 0, scope)}deg, ${stops})`;
    return `radial-gradient(circle, ${stops})`;
  }
  return `url("${paint.image}")`;
};

const backgroundCss = (paint: Paint | undefined, scope: Scope): CSSProperties => {
  const css = paintToCss(paint, scope);
  if (css === undefined) return {};
  if (typeof paint === 'object' && paint !== null && 'image' in paint) {
    return {
      backgroundImage: css,
      backgroundRepeat: paint.repeat === 'none' || paint.repeat === undefined ? 'no-repeat' : paint.repeat,
      backgroundSize: paint.size === 'tile' || paint.size === undefined ? 'auto' : paint.size,
    };
  }
  return { background: css };
};

const BORDER_SIDES = ['top', 'right', 'bottom', 'left'] as const;

const borderCss = (border: HudBorder | undefined, scope: Scope): CSSProperties => {
  if (border === undefined) return {};
  const width = num(border.width, scope);
  const color = paintToCss(border.color, scope) ?? 'transparent';
  const style = border.style ?? 'solid';
  const css: CSSProperties = {};
  BORDER_SIDES.forEach((side) => {
    const drawn = border.sides?.[side] ?? true;
    const cap = `${side[0].toUpperCase()}${side.slice(1)}` as 'Top' | 'Right' | 'Bottom' | 'Left';
    (css as Record<string, string>)[`border${cap}Width`] = `${drawn ? width : 0}px`;
    (css as Record<string, string>)[`border${cap}Style`] = style;
    (css as Record<string, string>)[`border${cap}Color`] = color;
  });
  return css;
};

const radiusCss = (radius: HudRadius | undefined, scope: Scope): CSSProperties => {
  if (radius === undefined) return {};
  if (Array.isArray(radius)) {
    const [tl, tr, br, bl] = radius.map((corner) => num(corner, scope));
    return { borderRadius: `${tl}px ${tr}px ${br}px ${bl}px` };
  }
  return { borderRadius: `${num(radius, scope)}px` };
};

const shadowCss = (shadow: readonly HudShadow[] | undefined, scope: Scope): CSSProperties => {
  if (!shadow?.length) return {};
  const boxShadow = shadow.map((layer) => {
    const x = num(layer.x, scope);
    const y = num(layer.y, scope);
    const blur = num(layer.blur, scope);
    const spread = layer.spread !== undefined ? num(layer.spread, scope) : 0;
    const color = paintToCss(layer.color, scope) ?? 'transparent';
    return `${layer.inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px ${color}`;
  }).join(', ');
  return { boxShadow };
};

/** Everything in `HudBoxStyle` that is plain CSS - `outline` and `tint` are
 *  `style-filters.ts`'s, combined into this result's `filter` by the caller. */
const styleToCss = (style: HudBoxStyle | undefined, scope: Scope): CSSProperties => {
  if (style === undefined) return {};
  return {
    ...backgroundCss(style.background, scope),
    ...borderCss(style.border, scope),
    ...radiusCss(style.radius, scope),
    ...shadowCss(style.shadow, scope),
    ...(style.clip ? { overflow: 'hidden' } : {}),
  };
};

export { styleToCss };
