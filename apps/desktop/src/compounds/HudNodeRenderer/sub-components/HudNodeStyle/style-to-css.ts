/* @layer renderer-hud @kind logic */
import { resolveValue } from '@rotp/hud';
import type { CSSProperties } from 'react';
import type { HudBorder, HudBoxStyle, HudRadius, HudShadow, Paint } from '@rotp/hud';
import { BORDER_SIDES } from './HudNodeStyle.constants';
import type { StyleScope } from './HudNodeStyle.type';

const num = (value: Parameters<typeof resolveValue>[0], scope: StyleScope): number => resolveValue(value, scope);

const paintToCss = (paint: Paint | undefined, scope: StyleScope): string | undefined => {
  if (paint === undefined) return undefined;
  if (typeof paint === 'string') return paint;
  if ('gradient' in paint) {
    const stops = paint.stops.map((stop) => `${stop.color} ${stop.at * 100}%`).join(', ');
    if (paint.gradient === 'linear') return `linear-gradient(${num(paint.angle ?? 0, scope)}deg, ${stops})`;
    return `radial-gradient(circle, ${stops})`;
  }
  return `url("${paint.image}")`;
};

const backgroundCss = (paint: Paint | undefined, scope: StyleScope): CSSProperties => {
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

const borderCss = (border: HudBorder | undefined, scope: StyleScope): CSSProperties => {
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

const radiusCss = (radius: HudRadius | undefined, scope: StyleScope): CSSProperties => {
  if (radius === undefined) return {};
  if (Array.isArray(radius)) {
    const [tl, tr, br, bl] = radius.map((corner) => num(corner, scope));
    return { borderRadius: `${tl}px ${tr}px ${br}px ${bl}px` };
  }
  return { borderRadius: `${num(radius, scope)}px` };
};

const shadowCss = (shadow: readonly HudShadow[] | undefined, scope: StyleScope): CSSProperties => {
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

const styleToCss = (style: HudBoxStyle | undefined, scope: StyleScope): CSSProperties => {
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
