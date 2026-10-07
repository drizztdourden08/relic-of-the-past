/* @layer renderer-hud @kind logic */
/**
 * `HudBoxStyle`, resolved to one `CSSProperties` object - the box's whole
 * face, applied to the wrapping `HudBox` every placed node already mounts
 * (`HudNodeRenderer.tsx`). `outline` and `tint` both come out as `filter`
 * values (`style-filters.ts`); CSS allows exactly one `filter`, so this is the
 * one place they are combined instead of each fighting the other for it.
 */

import { resolveValue } from '@shared/hud/data';
import { outlineFilter, tintFilter } from './style-filters';
import { styleToCss } from './style-to-css';
import type { CSSProperties } from 'react';
import type { HudBoxStyle, Paint } from '@shared/types/hud';

type Scope = Readonly<Record<string, number>>;

/** A ring or a tint is always a flat colour in practice - a gradient outline
 *  has no established meaning - so a non-string `Paint` reads as opaque black
 *  instead of silently drawing nothing. */
const flatColor = (paint: Paint): string => (typeof paint === 'string' ? paint : '#000');

const filterCss = (style: HudBoxStyle | undefined, scope: Scope): string | undefined => {
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

/** The whole face: background, border, radius, shadow, clip as plain CSS, plus
 *  outline and tint combined into one `filter`. */
const resolveNodeStyle = (style: HudBoxStyle | undefined, scope: Scope): CSSProperties => {
  const css = styleToCss(style, scope);
  const filter = filterCss(style, scope);
  return filter ? { ...css, filter } : css;
};

export { resolveNodeStyle };
