/* @layer renderer-components @kind logic */
/**
 * WHAT A COLLAPSED GROUP SAYS ABOUT ITSELF. This is the half of
 * `SubsectionGroup` that is not a component.
 *
 * Phase 8 of `plans/hud-inspector-ux-review.html` turns Appearance from ~1800px
 * of flat scroll into a list of applied effects, and the whole claim of that
 * shape is that a CLOSED group still states its value: `2px solid #c8a84e`,
 * `0 2 4 rgba(...)`, `multiply 1`. If the summary is wrong or empty the author has
 * to open every group to find the one that is doing something, which is the
 * flat scroll again with extra clicks.
 *
 * SUMMARIES ARE ONE LINE AT 188px, so they are terse by construction: a border
 * is `<width>px <style>` and its colour is the swatch beside it, not a
 * second hex in the text. `hex()` exists for the cases where the colour IS the
 * whole value (background, tint) and there is nothing else to say.
 *
 * A FORMULA READS AS A FORMULA. Every numeric field here is a `Value`, so a
 * bound width summarises as `= gap_base` and not as `[object Object]`.
 * `value-text.ts` already owns that spelling and this file defers to it.
 */
import { textOf } from './value-text';
import type { HudBorder, HudOutline, HudShadow, HudTint, Paint, Value } from '@shared/types/hud';

/** The CSS a preview chip is painted with. A flat colour goes verbatim, a gradient
 *  is drawn, and an image (no URL we can resolve) is reduced to a hatch. */
const swatchOf = (paint: Paint | undefined): string | undefined => {
  if (paint === undefined) return undefined;
  if (typeof paint === 'string') return paint;
  if ('gradient' in paint) {
    const stops = paint.stops.map((stop) => `${stop.color} ${Math.round(stop.at * 100)}%`).join(', ');
    return paint.gradient === 'radial'
      ? `radial-gradient(circle, ${stops})`
      : `linear-gradient(${typeof paint.angle === 'number' ? paint.angle : 0}deg, ${stops})`;
  }
  return 'repeating-linear-gradient(45deg, #555 0 3px, #333 3px 6px)';
};

/** A `Paint` in words. The flat case is the hex itself, because for a
 *  background or a tint the colour is the entire value. */
const paintText = (paint: Paint | undefined): string => {
  if (paint === undefined) return 'none';
  if (typeof paint === 'string') return paint;
  return 'gradient' in paint ? paint.gradient : (paint.image || 'image');
};

const num = (value: Value | undefined, fallback = '0'): string => (
  value === undefined ? fallback : textOf(value)
);

const borderSummary = (border: HudBorder | undefined): string => {
  if (!border) return 'off';
  const sides = border.sides;
  const off = sides ? (['top', 'right', 'bottom', 'left'] as const).filter((s) => sides[s] === false) : [];
  const drawn = off.length > 0 ? `, no ${off.join('/')}` : '';
  return `${num(border.width)}px ${border.style ?? 'solid'}${drawn}`;
};

const outlineSummary = (outline: HudOutline | undefined): string => (
  outline ? `${num(outline.width)}px, ink` : 'off'
);

const tintSummary = (tint: HudTint | undefined): string => (
  tint ? `${tint.mode ?? 'multiply'} ${num(tint.amount, '1')}` : 'off'
);

/**
 * `0 2 4 rgba(...)` uses the CSS shorthand order the author already reads on the
 * stage, so the summary and the rendered shadow are the same four numbers in
 * the same sequence. `spread` is included only when it is non-zero: three
 * numbers is the common shadow and a trailing `0` on every row is noise.
 */
const shadowSummary = (shadow: HudShadow): string => {
  const spread = shadow.spread !== undefined && shadow.spread !== 0 ? ` ${num(shadow.spread)}` : '';
  const inset = shadow.inset === true ? ' inset' : '';
  return `${num(shadow.x)} ${num(shadow.y)} ${num(shadow.blur)}${spread} ${paintText(shadow.color)}${inset}`;
};

/** The list's own header line, so the count is legible with every card shut. */
const shadowListSummary = (shadows: readonly HudShadow[]): string => (
  shadows.length === 0 ? 'none' : `${shadows.length} shadow${shadows.length === 1 ? '' : 's'}`
);

export {
  borderSummary, outlineSummary, paintText, shadowListSummary, shadowSummary, swatchOf, tintSummary,
};
