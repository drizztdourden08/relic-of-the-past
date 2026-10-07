/* @layer shared-hud @kind logic */
/**
 * Folds every bound `Value`/`Extent` on ONE node to a plain literal, against a
 * given scope - used by `expand.ts` to bake a `repeat` instance's own
 * `index`/`count`/`item` into the copy it produced, since neither name exists
 * in the document's GLOBAL data scope `measure.ts`/`place.ts` read later.
 *
 * WHY BAKING INSTEAD OF A PER-NODE SCOPE. `MeasureContext.scope` is one flat
 * table for the whole document - correct for every field that only reads the
 * global data table, wrong the moment a field inside a repeat's child reads
 * `index`. Baking that one instance's fields to numbers HERE, once, at
 * expansion, is a smaller change than teaching every downstream reader
 * (`resolve-box.ts`, `measure.ts`, `place-flow.ts`, `place-grid.ts`, the
 * renderer's own style resolution) to look up a scope per node instead of
 * once for the whole tree. It costs nothing: resolving a Value now, against
 * the exact scope it would have been resolved against a moment later in
 * `measure`/`place` within the SAME frame, produces an identical number.
 *
 * Only fields that are actually `Value`/`Extent`-shaped are touched; every
 * other field (`id`, `direction`, `layout`, `place`, `dimWhenEmpty`, a
 * sprite's `file`, a button's `bind`/`states`, and so on) passes through unchanged.
 */

import { bakeAnimation, bakeTransition } from './bake-motion';
import { resolveValue } from '../data/resolve-value';
import type { Extent, HudBox, HudContainer, HudNode } from '../../types/hud/hud-node';
import type { GradientStop, Paint, Value } from '../../types/hud/hud-value';
import type { HudBoxStyle, HudRadius } from '../../types/hud/hud-style';

type Scope = Readonly<Record<string, number>>;

const bakeValue = (value: Value | undefined, scope: Scope): Value | undefined => (
  value === undefined ? undefined : resolveValue(value, scope)
);

const bakeExtent = (extent: Extent | undefined, scope: Scope): Extent | undefined => {
  if (extent === undefined || extent === 'auto' || extent === 'fill') return extent;
  if ('px' in extent) return { px: resolveValue(extent.px, scope) };
  if ('pct' in extent) return { pct: resolveValue(extent.pct, scope) };
  return { px: resolveValue(extent, scope) }; // the bare-expression px shorthand
};

const bakeMinMax = (
  bound: { w?: Value; h?: Value } | undefined, scope: Scope,
): { w?: Value; h?: Value } | undefined => (
  bound === undefined ? undefined : {
    ...(bound.w !== undefined ? { w: bakeValue(bound.w, scope) } : {}),
    ...(bound.h !== undefined ? { h: bakeValue(bound.h, scope) } : {}),
  }
);

const bakePaint = (paint: Paint | undefined, scope: Scope): Paint | undefined => {
  if (paint === undefined || typeof paint === 'string' || 'image' in paint) return paint;
  const stops: GradientStop[] = paint.stops;
  return { ...paint, ...(paint.angle !== undefined ? { angle: bakeValue(paint.angle, scope) } : {}), stops };
};

const bakeRadius = (radius: HudRadius | undefined, scope: Scope): HudRadius | undefined => {
  if (radius === undefined) return undefined;
  if (Array.isArray(radius)) return radius.map((corner) => bakeValue(corner, scope) as Value) as HudRadius;
  return bakeValue(radius, scope) as Value;
};

const bakeStyle = (style: HudBoxStyle | undefined, scope: Scope): HudBoxStyle | undefined => {
  if (style === undefined) return undefined;
  return {
    ...style,
    ...(style.background !== undefined ? { background: bakePaint(style.background, scope) } : {}),
    ...(style.border ? { border: { ...style.border, width: bakeValue(style.border.width, scope) as Value, color: bakePaint(style.border.color, scope) as Paint } } : {}),
    ...(style.radius !== undefined ? { radius: bakeRadius(style.radius, scope) } : {}),
    ...(style.shadow ? {
      shadow: style.shadow.map((s) => ({
        ...s,
        x: bakeValue(s.x, scope) as Value,
        y: bakeValue(s.y, scope) as Value,
        blur: bakeValue(s.blur, scope) as Value,
        ...(s.spread !== undefined ? { spread: bakeValue(s.spread, scope) } : {}),
        color: bakePaint(s.color, scope) as Paint,
      })),
    } : {}),
    ...(style.outline ? { outline: { width: bakeValue(style.outline.width, scope) as Value, color: bakePaint(style.outline.color, scope) as Paint } } : {}),
    ...(style.tint ? {
      tint: {
        ...style.tint,
        color: bakePaint(style.tint.color, scope) as Paint,
        ...(style.tint.amount !== undefined ? { amount: bakeValue(style.tint.amount, scope) } : {}),
      },
    } : {}),
  };
};

/** The box half every node shares - `size`, `min`/`max`, `scale`, `opacity`,
 *  `visible`, `style`. */
const bakeSize = (size: HudBox['size'], scope: Scope): HudBox['size'] => (
  size === undefined ? undefined : {
    ...(size.w !== undefined ? { w: bakeExtent(size.w, scope) } : {}),
    ...(size.h !== undefined ? { h: bakeExtent(size.h, scope) } : {}),
  }
);

const bakeBox = (node: HudNode, scope: Scope): Partial<HudBox> => ({
  ...(node.size ? { size: bakeSize(node.size, scope) } : {}),
  ...(node.min ? { min: bakeMinMax(node.min, scope) } : {}),
  ...(node.max ? { max: bakeMinMax(node.max, scope) } : {}),
  ...(node.scale !== undefined ? { scale: bakeValue(node.scale, scope) } : {}),
  ...(node.opacity !== undefined ? { opacity: bakeValue(node.opacity, scope) } : {}),
  ...(node.visible !== undefined
    ? { visible: typeof node.visible === 'boolean' ? node.visible : bakeValue(node.visible, scope) }
    : {}),
  ...(node.style ? { style: bakeStyle(node.style, scope) } : {}),
  ...(node.animation ? { animation: node.animation.map((a) => bakeAnimation(a, scope)) } : {}),
  ...(node.transition ? { transition: bakeTransition(node.transition, scope) } : {}),
});

/** A container's own `gap.x`/`gap.y` - one shape under both engines since §57 -
 *  and a grid's track lists: the container-only fields `bakeBox` does not reach. */
const bakeContainerExtras = (node: HudContainer, scope: Scope): Partial<HudContainer> => {
  const gap = node.gap ? { gap: { x: bakeValue(node.gap.x, scope), y: bakeValue(node.gap.y, scope) } } : {};
  if (node.layout !== 'grid') return gap;
  return {
    columns: node.columns.map((c) => bakeExtent(c, scope) as Extent),
    ...(node.rows ? { rows: node.rows.map((r) => bakeExtent(r, scope) as Extent) } : {}),
    ...gap,
  };
};

/** `text`'s own bound fields - `value` (only when it is a `Value`, never a
 *  literal string) and `stroke.width`. `shape`'s own bound fields - `fill`,
 *  `armor`, `bands`. Every other element kind has nothing bindable outside
 *  the shared box. */
const bakeElement = (node: HudNode, scope: Scope): Record<string, unknown> => {
  if (node.kind !== 'element') return {};
  const { element } = node;
  if (element.type === 'text') {
    return {
      element: {
        ...element,
        ...(typeof element.value === 'string' ? {} : { value: bakeValue(element.value, scope) }),
        ...(element.stroke ? { stroke: { ...element.stroke, width: bakeValue(element.stroke.width, scope) as Value } } : {}),
      },
    };
  }
  if (element.type === 'shape') {
    return {
      element: {
        ...element,
        fill: bakeValue(element.fill, scope),
        ...(element.armor !== undefined ? { armor: bakeValue(element.armor, scope) } : {}),
        ...(element.bands !== undefined ? { bands: bakeValue(element.bands, scope) } : {}),
      },
    };
  }
  return {};
};

/** One node, every bound field folded to a literal against `scope`. `margin`/
 *  `padding` (`Edges`) are plain numbers already - nothing in this document
 *  model ever makes an edge bindable, so they pass through via the spread. */
const bakeNode = (node: HudNode, scope: Scope): HudNode => {
  const boxed = { ...node, ...bakeBox(node, scope), ...bakeElement(node, scope) } as HudNode;
  if (boxed.kind === 'container') return { ...boxed, ...bakeContainerExtras(boxed, scope) } as HudNode;
  return boxed;
};

export { bakeNode };
export type { Scope as BakeScope };
