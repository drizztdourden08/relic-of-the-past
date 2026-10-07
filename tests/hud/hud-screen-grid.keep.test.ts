/* @layer test @kind test */
/**
 * §42: two engines, not three, and a screen root that is a real grid.
 *
 * THE BAR IS PIXEL IDENTITY. Every engine change in this project has had to
 * draw the shipped HUD unchanged, and a migration that rewrites `regions[]`
 * into `screen.children` and every `stack` into a one-cell grid is exactly the
 * kind of change that has to prove it, not claim it. So this file pins
 * the real numbers off the real shipped document: the diamond of face buttons
 * (four satellites round a centre, each with a sprite ON its glyph), the d-pad
 * cross, the three bands' own corners. Those numbers were measured before the
 * change and are reproduced here unchanged - if one moves, the migration is
 * wrong and the expectation is not the thing to adjust.
 *
 * The rest is the four rules the collapse rests on:
 *  - an explicit cell is never refused for being taken, and auto-flow still
 *    walks past one;
 *  - two children of the SCREEN may overlap, which two regions always could;
 *  - paint order for co-placed children is `order`, then document order;
 *  - the screen's rectangle is still not a question it can answer.
 */
import { describe, expect, it } from 'vitest';
import { layoutHud, placedById } from '@shared/hud/engine';
import { layoutById, tryLoadLayout, validateLayout } from '@shared/hud/layouts';
import type { HudContainer, HudLayout, HudNode } from '@shared/types/hud';

const VIEW = { w: 398, h: 224 };
const SCOPE = {
  life_max: 160, life_current: 96, magic_max: 128, magic_current: 64, half_magic: 1,
  armor: 1, arrow_current: 12, arrow_max: 30, bomb_current: 7, bomb_max: 10,
  key_current: 3, rupee_current: 245, rupee_max: 999, silver_arrows: 1, slot_count: 8,
};

describe('the shipped HUD is pixel-identical to what the anchors drew', () => {
  const placed = layoutHud(layoutById('default') as HudLayout, VIEW, { scope: SCOPE, hearts: 20 });
  const rect = (id: string) => placedById(placed, id)?.rect;

  it('puts the screen at exactly the view and the three bands at their corners', () => {
    expect(rect('screen')).toEqual({ x: 0, y: 0, w: 398, h: 224 });
    // top-left, bottom-left, top-right - the three anchors the default used.
    expect(rect('vitals')).toEqual({ x: 8, y: 6, w: 116, h: 30 });
    expect(rect('wallet-region')).toEqual({ x: 8, y: 208, w: 48, h: 16 });
    expect(rect('buttons')).toEqual({ x: 284, y: 8, w: 106, h: 60 });
  });

  it('keeps the face cluster a diamond, sprite over glyph, not a flattened row', () => {
    // The four satellites round one centre - the exact geometry the `stack`
    // container drew, now four children of a one-cell grid.
    expect(rect('face-group')).toEqual({ x: 284, y: 8, w: 50, h: 60 });
    expect(rect('face-north')).toEqual({ x: 306, y: 18, w: 16, h: 16 });
    expect(rect('face-west')).toEqual({ x: 294, y: 30, w: 16, h: 16 });
    expect(rect('face-east')).toEqual({ x: 318, y: 30, w: 16, h: 16 });
    expect(rect('face-south')).toEqual({ x: 306, y: 42, w: 16, h: 16 });
    // The item sprite sits ON the glyph, offset by its own margin - the pair
    // that would have become two side-by-side boxes if `stack` had been read
    // as a column.
    expect(rect('face-south-glyph')).toEqual({ x: 306, y: 42, w: 16, h: 16 });
    expect(rect('face-south-item')).toEqual({ x: 306, y: 52, w: 16, h: 16 });
    const ids = placed.map((node) => node.id);
    expect(ids.indexOf('face-south-item')).toBeGreaterThan(ids.indexOf('face-south-glyph'));
  });

  it('keeps the d-pad cross centred in its satellites', () => {
    expect(rect('dpad-group')).toEqual({ x: 338, y: 12, w: 52, h: 52 });
    expect(rect('dpad-glyph')).toEqual({ x: 354, y: 28, w: 20, h: 20 });
  });
});

describe('the countdown (§62) joins every built-in without moving a pixel', () => {
  const VIEWS = [VIEW, { w: 256, h: 224 }, { w: 399, h: 224 }, { w: 512, h: 448 }];
  const COUNTING = { ...SCOPE, countdown_active: 1, countdown_seconds: 18, countdown_frames: 40 };
  /** The document as it shipped before §62: the same layout minus its countdown. */
  const without = (doc: HudLayout): HudLayout =>
    ({ ...doc, screen: { ...doc.screen, children: doc.screen.children.filter((c) => c.id !== 'countdown') } });

  it.each(['default', 'compact', 'bottom-right'])('%s: every other node is where it was, counting or not', (id) => {
    const doc = layoutById(id) as HudLayout;
    VIEWS.forEach((view) => [SCOPE, COUNTING].forEach((scope) => {
      const before = layoutHud(without(doc), view, { scope, hearts: 20 });
      const after = layoutHud(doc, view, { scope, hearts: 20 }).filter((node) => node.id !== 'countdown');
      expect(after.map((n) => [n.id, n.rect, n.scale, n.opacity, n.dimmed]))
        .toEqual(before.map((n) => [n.id, n.rect, n.scale, n.opacity, n.dimmed]));
    }));
  });

  it.each(['default', 'compact', 'bottom-right'])('%s: the pie sits where HudView draws it, and only while counting', (id) => {
    const doc = layoutById(id) as HudLayout;
    // Centred across the view, box bottom 12 px up, so the disc (4 px in) is two tiles up.
    expect(placedById(layoutHud(doc, VIEW, { scope: COUNTING }), 'countdown')?.rect)
      .toEqual({ x: 177, y: 168, w: 44, h: 44 });
    expect(placedById(layoutHud(doc, { w: 512, h: 448 }, { scope: COUNTING }), 'countdown')?.rect)
      .toEqual({ x: 234, y: 392, w: 44, h: 44 });
    expect(placedById(layoutHud(doc, VIEW, { scope: SCOPE }), 'countdown')).toBeUndefined();
  });
});

describe('a pre-§42 stack document migrates and draws identically', () => {
  const leaf = (id: string, extra: Partial<HudNode> = {}): HudNode =>
    ({ kind: 'element', id, element: { type: 'slot', index: 1 }, ...extra }) as HudNode;

  /** The overlay every shipped document wrote: `direction: 'stack'`, children
   *  moved only by their own margins, a negative one hanging outside. */
  const stored = {
    id: 'stored',
    name: 'Stored',
    builtIn: false,
    regions: [{
      anchor: 'top-left',
      root: {
        kind: 'container',
        id: 'overlay',
        direction: 'stack',
        children: [leaf('glyph'), leaf('sprite', { margin: { left: -4, top: 10 } })],
      },
    }],
  };

  it('rewrites the stack into a one-cell grid, with no alias left behind', () => {
    const result = tryLoadLayout(stored);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const overlay = result.doc.screen.children[0] as HudContainer;
    expect(overlay).toMatchObject({
      layout: 'grid', columns: ['auto'], rows: ['auto'], justifyItems: 'start', alignItems: 'start',
    });
    expect(overlay.children.map((child) => child.place))
      .toEqual([{ column: 1, row: 1 }, { column: 1, row: 1 }]);
    expect(JSON.stringify(result.doc)).not.toContain('stack');
    expect(JSON.stringify(result.doc)).not.toContain('direction');
  });

  it('draws every child exactly where the stack put it, box included', () => {
    const result = tryLoadLayout(stored);
    if (!result.ok) throw new Error(result.errors.join('\n'));
    const placed = layoutHud(result.doc, VIEW, {});
    const rect = (id: string) => placedById(placed, id)?.rect;
    expect(rect('glyph')).toEqual({ x: 0, y: 0, w: 16, h: 16 });
    expect(rect('sprite')).toEqual({ x: -4, y: 10, w: 16, h: 16 });
    // `stackSize` measured from the origin outward, margins included and
    // negatives shrinking instead of growing - which is now just an `auto`
    // track sized off its items' OUTER size.
    expect(rect('overlay')).toEqual({ x: 0, y: 0, w: 16, h: 26 });
  });
});

describe('overlap is explicit, and only auto-flow avoids it', () => {
  const box = (id: string, place: unknown, extra: Partial<HudNode> = {}): HudNode => ({
    kind: 'container', id, direction: 'row', children: [], place, size: { w: { px: 20 }, h: { px: 20 } }, ...extra,
  } as HudNode);

  const gridDoc = (children: HudNode[]): HudLayout => ({
    id: 'g',
    name: 'g',
    builtIn: false,
    screen: {
      kind: 'container', id: 'screen', layout: 'grid', columns: ['auto', 'fill', 'auto'],
      rows: ['auto', 'fill', 'auto'], justifyItems: 'start', alignItems: 'start', children,
    },
  });

  it('lets two children of the SCREEN share a cell, the way two regions could share a corner', () => {
    const doc = gridDoc([
      box('a', { column: 1, row: 1 }),
      box('b', { column: 1, row: 1 }, { margin: { left: 4, top: 4 } }),
    ]);
    const placed = layoutHud(doc, VIEW, {});
    expect(placedById(placed, 'a')?.rect).toMatchObject({ x: 0, y: 0 });
    expect(placedById(placed, 'b')?.rect).toMatchObject({ x: 4, y: 4 });
  });

  it('still makes auto-flow skip a cell an explicit placement claimed', () => {
    const doc = gridDoc([box('claimed', { column: 1, row: 1 }), box('auto', undefined)]);
    const placed = layoutHud(doc, VIEW, {});
    // Column 1 is taken, so the auto-flowed child lands in the next free cell.
    expect(placedById(placed, 'auto')?.rect.x).toBe(20);
  });

  it('paints co-placed children in `order`, then document order', () => {
    const at = { column: 1, row: 1 };
    const doc = gridDoc([box('first', at), box('second', at, { order: -1 })]);
    const ids = layoutHud(doc, VIEW, {}).map((node) => node.id);
    // `order: -1` visits 'second' first, so 'first' now paints on top of it.
    expect(ids.indexOf('second')).toBeLessThan(ids.indexOf('first'));
  });
});

describe('the screen keeps the lock that is about its rectangle, and loses the one that was not', () => {
  const screenWith = (extra: Record<string, unknown>) => validateLayout({
    id: 't',
    name: 't',
    builtIn: false,
    screen: {
      kind: 'container', id: 'screen', layout: 'grid', columns: ['auto'], children: [], ...extra,
    },
  });

  it('still refuses a size, a margin and a scale on the screen', () => {
    expect(screenWith({ size: { w: { px: 100 } } }).doc).toBeNull();
    expect(screenWith({ margin: { top: 4 } }).doc).toBeNull();
    expect(screenWith({ scale: 2 }).doc).toBeNull();
  });

  it('accepts the screen naming its own engine, columns and rows (§42 over §38.4)', () => {
    expect(screenWith({ columns: ['auto', 'fill', { px: 40 }], rows: [{ pct: 50 }, 'fill'] }).errors).toEqual([]);
    expect(validateLayout({
      id: 't', name: 't', builtIn: false,
      screen: { kind: 'container', id: 'screen', direction: 'column', children: [] },
    }).errors).toEqual([]);
  });
});
