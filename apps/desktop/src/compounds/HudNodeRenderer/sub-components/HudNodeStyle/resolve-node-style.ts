/* @layer renderer-hud @kind logic */
import { resolveValue } from '@rotp/hud';
import { outlineFilter } from './outline-filter';
import { styleToCss } from './style-to-css';
import { tintFilter } from './tint-filter';
import type { CSSProperties } from 'react';
import type { HudBoxStyle, Paint } from '@rotp/hud';
import type { StyleScope } from './HudNodeStyle.type';

const flatColor = (paint: Paint): string => (typeof paint === 'string' ? paint : '#000');

const filterCss = (style: HudBoxStyle | undefined, scope: StyleScope): string | undefined => {
  const filters: string[] = [];
  if (style?.outline) {
    const width = resolveValue(style.outline.width, scope);
    const outline = outlineFilter(width, flatColor(style.outline.color));
    if (outline) filters.push(outline);
  }
  if (style?.tint) {
    const amount = style.tint.amount !== undefined ? resolveValue(style.tint.amount, scope) : 1;
    filters.push(tintFilter(flatColor(style.tint.color), style.tint.mode ?? 'multiply', amount));
  }
  return filters.length ? filters.join(' ') : undefined;
};

const resolveNodeStyle = (style: HudBoxStyle | undefined, scope: StyleScope): CSSProperties => {
  const css = styleToCss(style, scope);
  const filter = filterCss(style, scope);
  return filter ? { ...css, filter } : css;
};

export { resolveNodeStyle };
