/* @layer test @kind test */
/**
 * The stage's grid drawings cover the grid they draw.
 *
 * THE BUG THIS PINS. `gridCellRects(container, box, unit, ctx)` wants `box` and
 * its answer in ONE space, with `unit` that space's px per authored px. The
 * stage echo and the grid overlay both passed the game-px rect with the DISPLAY
 * scale as `unit` and painted the result as display px. Fixed tracks came out
 * right, so it looked plausible; the area a `fill` track shares stayed in game
 * px, so the whole grid drew at `1 / displayScale` of its size. At the editor's
 * ~1.39 that is 72 %: selecting all nine cells of the screen lit 72 % of the
 * stage, and "column 3" ended there instead of over the buttons.
 *
 * The older echo test could not see it twice over: it computed its expectation
 * with the same wrong call, and its fixture had no `fill` track.
 *
 * So this asserts the PROPERTY, against a rectangle that does not come from the
 * solve at all: every cell together is exactly the container's placed rect, at
 * the display scale. The first case fails against the old convention.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { gridCellRects } from '../../shared/hud/engine/place-grid';
import { stageCellRects } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/stage-cells';
import type { PlacedNode } from '../../shared/hud/engine';
import type { HudGridContainer } from '../../shared/types/hud';
import type { Rect } from '../../shared/hud/layouts/geometry.type';

const EDITOR = resolve(__dirname, '../../apps/web/src/ui/domains/app/views/HudLayoutEditor');

/** The screen root's own shape: bands that hug, a middle that eats the rest. */
const SCREEN: HudGridContainer = {
  kind: 'container', id: 'screen', layout: 'grid',
  columns: [{ px: 124 }, 'fill', { px: 114 }],
  rows: [{ px: 44 }, 'fill', { px: 24 }],
  children: [],
};

const placedAt = (rect: Rect, scale: number): PlacedNode =>
  ({ id: 'screen', node: SCREEN, rect, scale, opacity: 1, dimmed: false });

const hull = (rects: readonly Rect[]): Rect => {
  const x = Math.min(...rects.map((r) => r.x));
  const y = Math.min(...rects.map((r) => r.y));
  return {
    x, y,
    w: Math.max(...rects.map((r) => r.x + r.w)) - x,
    h: Math.max(...rects.map((r) => r.y + r.h)) - y,
  };
};

const VIEW: Rect = { x: 0, y: 0, w: 398, h: 224 };
const DISPLAY = 1.39;

describe('a placed grid\'s cells, at the display scale', () => {
  it('together cover exactly the container - not 1/scale of it', () => {
    const cells = stageCellRects(placedAt(VIEW, 1), DISPLAY, {});
    const all = hull(cells.map((c) => c.rect));
    expect(all.x).toBeCloseTo(0, 6);
    expect(all.y).toBeCloseTo(0, 6);
    expect(all.w).toBeCloseTo(398 * DISPLAY, 6);
    expect(all.h).toBeCloseTo(224 * DISPLAY, 6);
  });

  it('shows what the old convention got wrong instead of describing it', () => {
    // The display scale handed over as the UNIT: the grid comes out the size of
    // its GAME rect, painted as if that were display px.
    const wrong = hull(gridCellRects(SCREEN, VIEW, DISPLAY, {}).map((c) => c.rect));
    expect(wrong.w).toBeCloseTo(398, 6);
    expect(wrong.w / (398 * DISPLAY)).toBeCloseTo(1 / DISPLAY, 6);   // the 72 %
  });

  it('puts the last column against the right edge, where the buttons are', () => {
    const cells = stageCellRects(placedAt(VIEW, 1), DISPLAY, {});
    const topRight = cells.find((c) => c.column === 3 && c.row === 1);
    expect(topRight).toBeDefined();
    expect((topRight?.rect.x ?? 0) + (topRight?.rect.w ?? 0)).toBeCloseTo(398 * DISPLAY, 6);
    expect(topRight?.rect.w).toBeCloseTo(114 * DISPLAY, 6);
    expect(topRight?.rect.x).toBeCloseTo((398 - 114) * DISPLAY, 6);
  });

  it('carries an offset container\'s origin through the display scale too', () => {
    const at: Rect = { x: 8, y: 6, w: 300, h: 120 };
    const all = hull(stageCellRects(placedAt(at, 1), 2, {}).map((c) => c.rect));
    expect(all).toEqual({ x: 16, y: 12, w: 600, h: 240 });
  });

  it('solves a grid inside a scaled subtree with ITS unit, and still covers it', () => {
    // The compact layout runs at 0.75: the container's placed rect is already
    // in game px, and its authored 124 px band is 93 game px wide.
    const host = placedAt({ x: 0, y: 0, w: 298.5, h: 168 }, 0.75);
    const cells = stageCellRects(host, DISPLAY, {});
    const all = hull(cells.map((c) => c.rect));
    expect(all.w).toBeCloseTo(298.5 * DISPLAY, 6);
    expect(all.h).toBeCloseTo(168 * DISPLAY, 6);
    expect(cells.find((c) => c.column === 1 && c.row === 1)?.rect.w).toBeCloseTo(124 * 0.75 * DISPLAY, 6);
  });
});

describe('one door to the solve', () => {
  const sources = (dir: string): string[] => readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return sources(full);
    return /\.tsx?$/.test(name) ? [full] : [];
  });

  it('no stage drawing calls gridCellRects itself - the unit is too easy to get wrong', () => {
    const offenders = sources(EDITOR)
      .filter((file) => !file.endsWith('stage-cells.ts'))
      .filter((file) => /\bgridCellRects\s*\(/.test(readFileSync(file, 'utf8')));
    expect(offenders).toEqual([]);
  });
});
