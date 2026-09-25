/* @layer test @kind test */
/**
 * Phase 2 of `plans/hud-data-binding.html`: bindable boxes. `size`, `scale`,
 * `opacity`, `gap` and `visible` all take a `Value`, resolved against
 * `MeasureContext.scope` before anything is measured.
 *
 * THE ACCEPTANCE PROOF THE PLAN NAMES: the magic bar becomes authorable with
 * NO new element kind - a sprite whose `size.w` is
 * `{ from: 'data', expr: 'magic_current / 128 * 24' }`. See "the magic bar"
 * below. Its final PAINTED rect is asserted through a CONTAINER sibling
 * (`rectOf`), never through the sprite's own placed rect - an element is
 * always CONTAINED to its intrinsic aspect (`hud-layout-engine.keep.test.ts`
 * already proves that rule), so only a container's rect equals its resolved
 * box exactly. `measureBox` proves the same width directly, box-side.
 */
import { describe, expect, it } from 'vitest';
import { layoutHud, measureBox, placedById } from '@shared/hud/engine';
import type { HudContainer, HudLayout, HudNode } from '@shared/types/hud';

const VIEW = { w: 400, h: 200 };

const leaf = (id: string, extra: Partial<HudNode> = {}): HudNode => ({
  kind: 'element', id, element: { type: 'slot', index: 1 }, ...extra,
} as HudNode);

/** A childless container's placed rect equals its resolved box exactly - it
 *  is never run through `containRect`, which only an element is. Using one
 *  here is what lets a test assert a bound `size` without an intrinsic aspect
 *  getting in the way. */
const box = (id: string, extra: Partial<HudContainer> = {}): HudNode => ({
  kind: 'container', id, direction: 'row', children: [], ...extra,
} as HudNode);

/** The screen the nine anchors became (§42): three bands each way, with this
 *  root in the top-left cell - exactly what `anchor: 'top-left'` used to say. */
const docOf = (root: HudContainer): HudLayout => ({
  id: 'test',
  name: 'Test',
  builtIn: false,
  screen: {
    kind: 'container',
    id: 'screen',
    layout: 'grid',
    columns: ['auto', 'fill', 'auto'],
    rows: ['auto', 'fill', 'auto'],
    justifyItems: 'start',
    alignItems: 'start',
    children: [{ ...root, place: { column: 1, row: 1 } }],
  },
});

const row = (children: HudNode[], extra: Partial<HudContainer> = {}): HudContainer => ({
  kind: 'container', id: 'root', direction: 'row', children, ...extra,
} as HudContainer);

const rectOf = (doc: HudLayout, id: string, scope?: Record<string, number>) =>
  placedById(layoutHud(doc, VIEW, { scope }), id)?.rect;

describe('the magic bar - size.w bound to an expression, no new element kind', () => {
  const magicBar = (): HudNode => ({
    kind: 'element',
    id: 'magic-bar',
    size: { w: { from: 'data', expr: 'magic_current / 128 * 24' }, h: { px: 8 } },
    element: { type: 'sprite', file: 'magic-fill' },
  } as HudNode);

  it('a full bar resolves the expression to the full 24px width (box-side, via measureBox)', () => {
    expect(measureBox(magicBar(), { scope: { magic_current: 128 } }).w).toBe(24);
  });

  it('a half-full bar resolves to exactly half', () => {
    expect(measureBox(magicBar(), { scope: { magic_current: 64 } }).w).toBe(12);
  });

  it('zero magic resolves to a zero-width box, which LEAVES THE FLOW entirely', () => {
    const doc = docOf(row([magicBar(), leaf('after')], { gap: { x: 4, y: 4 } }));
    expect(rectOf(doc, 'magic-bar', { magic_current: 0 })).toBeUndefined();
    // and it takes its gap with it - "after" sits at x0, not x4.
    expect(rectOf(doc, 'after', { magic_current: 0 })?.x).toBe(0);
  });

  it('a non-empty bar stays in the flow and reserves its own gap', () => {
    const doc = docOf(row([magicBar(), leaf('after')], { gap: { x: 4, y: 4 } }));
    expect(rectOf(doc, 'after', { magic_current: 128 })?.x).toBe(28);
  });

  it('an absent scope still resolves - the expression folds to its documented default (0)', () => {
    expect(measureBox(magicBar(), {}).w).toBe(0);
  });
});

describe('visible, scale and opacity all accept a Value', () => {
  it('visible resolves truthy from data, not only from a literal boolean', () => {
    const doc = docOf(row([
      leaf('a', { visible: { from: 'data', expr: 'arrow_current > 0' } } as Partial<HudNode>),
      leaf('b'),
    ], { gap: { x: 4, y: 4 } }));
    expect(rectOf(doc, 'a', { arrow_current: 0 })).toBeUndefined();
    expect(rectOf(doc, 'b', { arrow_current: 0 })?.x).toBe(0);
    expect(rectOf(doc, 'a', { arrow_current: 5 })).toBeDefined();
    expect(rectOf(doc, 'b', { arrow_current: 5 })?.x).toBe(20);
  });

  it('a literal Value resolves exactly as a bare number always has (scale)', () => {
    const bound = docOf(row([leaf('a')], { scale: { from: 'data', expr: '0.5' } } as Partial<HudContainer>));
    const literal = docOf(row([leaf('a')], { scale: 0.5 }));
    expect(measureBox(bound.screen.children[0])).toEqual(measureBox(literal.screen.children[0]));
  });

  it('opacity resolves from data and is clamped to 0..1 even when the expression is not', () => {
    const doc = docOf(row([leaf('a', { opacity: { from: 'data', expr: 'silver_arrows * 5' } } as Partial<HudNode>)]));
    expect(placedById(layoutHud(doc, VIEW, { scope: { silver_arrows: 1 } }), 'a')?.opacity).toBe(1);
    expect(placedById(layoutHud(doc, VIEW, { scope: { silver_arrows: 0 } }), 'a')?.opacity).toBe(0);
  });

  it('gap resolves from data on a flex container', () => {
    const expr = { from: 'data', expr: 'half_magic * 10' };
    const doc = docOf(row([leaf('a'), leaf('b')], { gap: { x: expr, y: expr } } as Partial<HudContainer>));
    expect(rectOf(doc, 'b', { half_magic: 1 })?.x).toBe(26);
    expect(rectOf(doc, 'b', { half_magic: 0 })?.x).toBe(16);
  });
});

describe('min/max on every extent - a fill child no longer collapses to nothing', () => {
  it('a fill child holds its min when the row has nothing left to give it', () => {
    const doc = docOf(row([
      box('fixed', { size: { w: { px: 400 }, h: { px: 10 } } } as Partial<HudContainer>),
      box('shrunk', { size: { w: 'fill', h: { px: 10 } }, min: { w: 20 } } as Partial<HudContainer>),
    ], { size: { w: { px: 100 } } }));
    expect(rectOf(doc, 'shrunk')?.w).toBe(20);
  });

  it('without a min the same layout collapses the fill child to zero (and it leaves the flow)', () => {
    const doc = docOf(row([
      box('fixed', { size: { w: { px: 400 }, h: { px: 10 } } } as Partial<HudContainer>),
      box('shrunk', { size: { w: 'fill', h: { px: 10 } } } as Partial<HudContainer>),
    ], { size: { w: { px: 100 } } }));
    expect(rectOf(doc, 'shrunk')).toBeUndefined();
  });

  it('max caps a size that would otherwise grow past it', () => {
    const doc = docOf(row([
      box('a', { size: { w: 'fill', h: { px: 10 } }, max: { w: 40 } } as Partial<HudContainer>),
    ], { size: { w: { px: 200 } } }));
    expect(rectOf(doc, 'a')?.w).toBe(40);
  });

  it('min/max apply to a fixed px size exactly the same way - every extent, not only fill', () => {
    const doc = docOf(row([box('a', { size: { w: { px: 5 }, h: { px: 10 } }, min: { w: 20 } } as Partial<HudContainer>)]));
    expect(rectOf(doc, 'a')?.w).toBe(20);
  });
});
