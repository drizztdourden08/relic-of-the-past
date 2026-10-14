/* @layer test @kind test */
import { describe, expect, it } from 'vitest';
import { aspectOf, containRect, intrinsicSize, layoutHud, measureBox, placedById, validateLayout } from '@rotp/hud';
import type { HudContainer, HudFlexContainer, HudLayout, HudNode } from '@rotp/hud';
import { required } from '../required';

const VIEW = { w: 400, h: 200 };

const leaf = (id: string, extra: Partial<HudNode> = {}): HudNode => ({
  kind: 'element', id, element: { type: 'slot', index: 1 }, ...extra,
} as HudNode);

const screenOf = (
  root: HudContainer, place = { column: 1, row: 1 }, extra: Pick<HudFlexContainer, 'alignSelf'> = {},
): HudContainer => ({
  kind: 'container',
  id: 'screen',
  layout: 'grid',
  columns: ['auto', 'fill', 'auto'],
  rows: ['auto', 'fill', 'auto'],
  justifyItems: 'start',
  alignItems: 'start',
  children: [{ ...root, place, ...extra }],
});

const docOf = (root: HudContainer): HudLayout => ({
  id: 'test', name: 'Test', builtIn: false, screen: screenOf(root),
});

const row = (children: HudNode[], extra: Partial<HudFlexContainer> = {}): HudFlexContainer => ({
  kind: 'container', id: 'root', direction: 'row', children, ...extra,
});

const rectOf = (doc: HudLayout, id: string, ctx = {}) =>
  placedById(layoutHud(doc, VIEW, ctx), id)?.rect;

describe('boxes, extents and the flow', () => {
  it('a row lays its children out along x, a column along y, both with the gap', () => {
    const across = docOf(row([leaf('a'), leaf('b')], { gap: { x: 4, y: 4 } }));
    const down = docOf(row([leaf('a'), leaf('b')], { gap: { x: 4, y: 4 }, direction: 'column' }));
    expect(rectOf(across, 'b')?.x).toBe(20);
    expect(rectOf(across, 'b')?.y).toBe(0);
    expect(rectOf(down, 'b')?.y).toBe(20);
  });

  it('an overlay - one grid cell, every child in it - moves them only by their own margins', () => {
    const at = { column: 1, row: 1 };
    const doc = docOf({
      kind: 'container',
      id: 'root',
      layout: 'grid',
      columns: ['auto'],
      rows: ['auto'],
      justifyItems: 'start',
      alignItems: 'start',
      children: [leaf('a', { place: at }), leaf('b', { place: at, margin: { left: -4, top: 6 } })],
    });
    expect(rectOf(doc, 'a')).toEqual({ x: 0, y: 0, w: 16, h: 16 });
    expect(rectOf(doc, 'b')).toEqual({ x: -4, y: 6, w: 16, h: 16 });
    expect(rectOf(doc, 'root')).toEqual({ x: 0, y: 0, w: 16, h: 22 });
  });

  it('pct measures against the parent box and fill shares what is left', () => {
    const doc = docOf(row([
      leaf('half', { size: { w: { pct: 50 } } }),
      leaf('rest', { size: { w: 'fill' } }),
    ], { size: { w: { px: 200 } } }));
    expect(rectOf(doc, 'half')?.w).toBe(16);
    expect(rectOf(doc, 'half')?.x).toBe(42);
    expect(rectOf(doc, 'rest')?.x).toBe(142);
  });

  it('wrap breaks a line when the next child does not fit, and keeps the gap', () => {
    const doc = docOf(row([leaf('a'), leaf('b'), leaf('c')], {
      wrap: true, gap: { x: 4, y: 4 }, size: { w: { px: 40 } },
    }));
    expect(rectOf(doc, 'b')?.x).toBe(20);
    expect(rectOf(doc, 'c')?.y).toBe(20);
    expect(rectOf(doc, 'c')?.x).toBe(0);
  });

  it('justify and align move children inside a box bigger than they are', () => {
    const doc = docOf(row([leaf('a'), leaf('b')], {
      size: { w: { px: 100 }, h: { px: 40 } }, justify: 'between', align: 'center',
    }));
    expect(rectOf(doc, 'b')?.x).toBe(84);
    expect(rectOf(doc, 'a')?.y).toBe(12);
  });

});

describe('boxes, extents and the flow', () => {
  describe('the three space distributions put the ends where they say', () => {
    const three = (justify: 'between' | 'around' | 'evenly'): (number | undefined)[] => {
      const doc = docOf(row([leaf('a'), leaf('b'), leaf('c')], {
        size: { w: { px: 96 } }, justify,
      }));
      return ['a', 'b', 'c'].map((id) => rectOf(doc, id)?.x);
    };

    it('leaves nothing at the ends for between, half a gap for around, a whole one for evenly', () => {
      expect(three('between')).toEqual([0, 40, 80]);
      expect(three('around')).toEqual([8, 40, 72]);
      expect(three('evenly')).toEqual([12, 40, 68]);
    });

    it('falls back to start for a line of one, the way between always has', () => {
      for (const justify of ['between', 'around', 'evenly'] as const) {
        const doc = docOf(row([leaf('only')], { size: { w: { px: 96 } }, justify }));
        expect(`${justify} ${rectOf(doc, 'only')?.x}`).toBe(`${justify} 0`);
      }
    });

    it('is a value a saved document round-trips', () => {
      const doc = docOf(row([leaf('a'), leaf('b')], { size: { w: { px: 96 } }, justify: 'evenly' }));
      const parsed = validateLayout(JSON.parse(JSON.stringify(doc)));
      expect(parsed.errors).toEqual([]);
      expect((parsed.doc?.screen.children[0] as HudFlexContainer).justify).toBe('evenly');
    });
  });

  it('scale multiplies the whole subtree - contents, padding and gaps alike', () => {
    const doc = docOf(row([leaf('a'), leaf('b')], {
      gap: { x: 8, y: 8 }, padding: { left: 10 }, scale: 0.5,
    }));
    expect(rectOf(doc, 'a')).toEqual({ x: 5, y: 0, w: 8, h: 8 });
    expect(rectOf(doc, 'b')?.x).toBe(17);
    const scaled = docOf(row([leaf('a')], { scale: 0.5 }));
    expect(measureBox(required(scaled.screen.children[0], 'the scaled row'))).toEqual({ w: 8, h: 8 });
  });
});

describe('nothing ever stretches', () => {
  it('a box of the wrong shape letterboxes the content and centres it', () => {
    const fitted = containRect({ w: 16, h: 16 }, { x: 0, y: 0, w: 64, h: 32 });
    expect(fitted).toEqual({ x: 16, y: 0, w: 32, h: 32 });
  });

  it('an element given a wider box keeps its aspect', () => {
    const doc = docOf(row([leaf('a', { size: { w: { px: 64 }, h: { px: 16 } } })]));
    const rect = rectOf(doc, 'a');
    expect(rect?.w).toBe(rect?.h);
    expect(aspectOf({ type: 'slot', index: 1 })).toBe(1);
    expect(aspectOf({ type: 'sprite', file: 'x', box: { w: 24, h: 8 } })).toBe(3);
  });

  it('a shape draws at a fixed size whatever context it is measured in', () => {
    expect(intrinsicSize({ type: 'shape', shape: 'heart', fill: 1 })).toEqual({ w: 8, h: 8 });
    expect(intrinsicSize({ type: 'shape', shape: 'magic-bar', fill: 1 }, { hearts: 3 })).toEqual({ w: 80, h: 16 });
  });
});

describe('cells, visibility, opacity and dimming', () => {
  it('each band of the screen pins its child, and margins measure inward from it', () => {
    const at = (place: { column: number; row: number }, extra: Pick<HudFlexContainer, 'alignSelf'>) => {
      const root = row([leaf('a')], { margin: { left: 8, top: 8, right: 8, bottom: 8 } });
      const doc: HudLayout = {
        id: 'a', name: 'a', builtIn: false, screen: screenOf(root, place, extra),
      };
      return placedById(layoutHud(doc, VIEW, {}), 'root')?.rect;
    };
    expect(at({ column: 1, row: 1 }, {})).toMatchObject({ x: 8, y: 8 });
    expect(at({ column: 3, row: 3 }, { alignSelf: 'end' })).toMatchObject({ x: 376, y: 176 });
    expect(at({ column: 2, row: 2 }, { alignSelf: 'center' })).toMatchObject({ x: 192, y: 92 });
  });

  it('an invisible node leaves the flow instead of holding its place', () => {
    const doc = docOf(row([leaf('a', { visible: false }), leaf('b')], { gap: { x: 4, y: 4 } }));
    expect(rectOf(doc, 'a')).toBeUndefined();
    expect(rectOf(doc, 'b')?.x).toBe(0);
  });

  it('opacity multiplies down the tree and dimming is inherited with it', () => {
    const doc = docOf(row([
      { kind: 'container', id: 'group', direction: 'row', opacity: 0.5, dimWhenEmpty: [5, 6],
        children: [leaf('a', { opacity: 0.5 })] },
    ]));
    const placed = layoutHud(doc, VIEW, { filledSlots: [1] });
    expect(placedById(placed, 'a')?.opacity).toBe(0.25);
    expect(placedById(placed, 'a')?.dimmed).toBe(true);
    const live = layoutHud(doc, VIEW, { filledSlots: [6] });
    expect(placedById(live, 'a')?.dimmed).toBe(false);
  });
});
