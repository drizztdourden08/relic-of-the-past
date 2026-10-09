/* @layer tests @kind test */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { readFileSync } from 'fs';
import { gridCellRects } from '../../../shared/hud/engine/place-grid';
import { hull } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/StageGridEcho';
import { CTX, ECHO, ECHO_BOX, ECHO_GRID, ECHO_SCALE, EDITOR_DIR, RAILS } from './metrics.constants';
import { measureMetrics } from './measure-metrics';
import type { MetricsRig } from './metrics.type';

vi.mock('@app/stores/hud-editor-view-store', async () => {
  const constants = await import('./metrics.constants');
  return {
    useHudEditorViewStore: (select: (s: Record<string, unknown>) => unknown) =>
      select({ gridEcho: constants.ECHO, setGridEcho: () => {} }),
  };
});

let rig: MetricsRig;

beforeAll(async () => { rig = await measureMetrics(); }, 60_000);

afterAll(async () => { await rig?.close(); });

describe('past the fit it scrolls, and the header strips do not go with it', () => {
  it('overflows a twelve-column grid instead of shrinking its cells', () => {
    for (const rail of RAILS) {
      const port = (rig.read[rail]?.scroll ?? []).find((s) => s.case === 'twelve');
      expect(`${rail} scrolls ${(port?.scrollW ?? 0) > (port?.clientW ?? 0)}`).toBe(`${rail} scrolls true`);
      for (const c of rig.cellsOf(rail, 'twelve')) expect(c.width).toBeGreaterThanOrEqual(24);
    }
  });

  it('caps its own height and scrolls there too instead of pushing the legend away', () => {
    for (const rail of RAILS) {
      const port = (rig.read[rail]?.scroll ?? []).find((s) => s.case === 'twelve');
      expect(`${rail} height ${(port?.clientH ?? 0) <= 220}`).toBe(`${rail} height true`);
      expect(`${rail} tall ${(port?.scrollH ?? 0) > (port?.clientH ?? 0)}`).toBe(`${rail} tall true`);
    }
  });

  it('keeps both strips pinned to the viewport while the body moves under them', () => {
    for (const rail of RAILS) {
      const { before, after } = rig.read[rail].frozen;
      expect(`${rail} ${after.sticky}`).toBe(`${rail} sticky`);
      expect(`${rail} row ${Math.abs(after.rowHeadOffset - before.rowHeadOffset) <= 3}`).toBe(`${rail} row true`);
      expect(`${rail} col ${Math.abs(after.colHeadOffset - before.colHeadOffset) <= 3}`).toBe(`${rail} col true`);
    }
  });
});

describe('the four cell states are four different paints', () => {
  it('tells empty, occupied, selected and selected-on-occupied apart by computed style', () => {
    const paint = rig.read[232].paint;
    expect(Object.keys(paint).sort()).toEqual(['empty', 'occupied', 'occupied-selected', 'selected']);
    expect(new Set(Object.values(paint)).size).toBe(4);
    expect(paint['occupied-selected']).toContain('repeating-linear-gradient');
    expect(paint.empty).toContain('none');
    expect(paint.occupied).toContain('none');
    expect(paint.selected).toContain('none');
  });
});

describe('the stage echo is `gridCellRects`\' own answer, to the pixel', () => {
  it('washes exactly the rectangle the solve gives for the selected cells', () => {
    const solved = gridCellRects(ECHO_GRID, ECHO_BOX, 1, CTX)
      .filter((c) => c.column >= ECHO.c0 && c.column <= ECHO.c1 && c.row >= ECHO.r0 && c.row <= ECHO.r1);
    expect(solved.length).toBe(2);
    const g = hull(solved.map((c) => c.rect));
    const want = { x: g.x * ECHO_SCALE, y: g.y * ECHO_SCALE, w: g.w * ECHO_SCALE, h: g.h * ECHO_SCALE };
    for (const rail of RAILS) {
      const got = rig.read[rail].echo;
      expect(`${rail} echo ${got?.x},${got?.y} ${got?.w}x${got?.h}`)
        .toBe(`${rail} echo ${want.x},${want.y} ${want.w}x${want.h}`);
    }
  });

  it('never takes the pointer, because the surface it replaces was clickable and §46 took that away', () => {
    const sheet = readFileSync(`${EDITOR_DIR}/GridEditor/HudLayoutEditor.grid.css`, 'utf8');
    expect(sheet).toMatch(/\.hud-grid-echo\s*\{[^}]*pointer-events:\s*none/);
  });
});
