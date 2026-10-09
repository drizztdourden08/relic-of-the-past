/* @layer tests @kind test */
import { describe, expect, it, vi } from 'vitest';
import { layoutHud, placedById, validateLayout } from '@rotp/hud';
import { insertTrack, moveTrack, removeTrack, setTrack, trackText } from '@app/views/HudLayoutEditor/behavior/track-extents';
import { newGrid } from '@app/views/HudLayoutEditor/behavior/new-node';
import { buildToolbarGroups } from '@app/views/HudLayoutEditor/behavior/toolbar-menus';
import type { MenuItem, MenuNode } from '@drizztdourden08/tessera/composites';
import type { Extent, HudGridContainer, HudLayout, HudNode } from '@rotp/hud';
import { VIEW } from './section-controls.constants';
import { boxCell as cell } from './box-cell';
import { docOf } from './doc-of';

const menuItems = (nodes: readonly MenuNode[]): MenuItem[] =>
  nodes.filter((node): node is MenuItem => !('separator' in node));

interface ViewSnapshot {
  gridOverlayEnabled: boolean;
  editorStep: number;
  toggleGridOverlay: () => void;
}
vi.mock('@app/stores/hud-editor-view-store', () => ({
  EDITOR_STEPS: [1, 2, 4, 8],
  useHudEditorViewStore: (select: (s: ViewSnapshot) => unknown) =>
    select({ gridOverlayEnabled: true, editorStep: 1, toggleGridOverlay: () => {} }),
}));

describe('a track list survives the document it is written to', () => {
  it('adds, sizes, reorders and removes, then places what it said it would', () => {
    let columns: Extent[] = [{ px: 20 }];
    columns = insertTrack(columns, 0);
    expect(columns).toEqual([{ px: 20 }, 'auto']);
    columns = setTrack(columns, 1, { px: 30 });
    columns = moveTrack(columns, 0, 1);
    expect(columns.map(trackText)).toEqual(['30px', '20px']);

    const grid: HudGridContainer = {
      kind: 'container', id: 'grid', layout: 'grid', columns, rows: [{ px: 10 }],
      children: [cell('a', { place: { column: 1, row: 1 } }), cell('b', { place: { column: 2, row: 1 } })],
    };
    const parsed = validateLayout(JSON.parse(JSON.stringify(docOf(grid))));
    expect(parsed.errors).toEqual([]);
    const placed = layoutHud(parsed.doc as HudLayout, VIEW, {});
    expect(placedById(placed, 'a')?.rect.x).toBe(0);
    expect(placedById(placed, 'b')?.rect.x).toBe(30);
  });

  it('refuses a move that would run off either end instead of clamping it', () => {
    const tracks: Extent[] = ['auto', 'fill'];
    expect(moveTrack(tracks, 0, -1)).toEqual(tracks);
    expect(moveTrack(tracks, 1, 1)).toEqual(tracks);
    expect(moveTrack(tracks, 0, 1)).toEqual(['fill', 'auto']);
  });

  it('lets the row axis empty back to implicit, and keeps a validator happy', () => {
    const rows = removeTrack([{ px: 10 }], 0);
    expect(rows).toEqual([]);
    const grid = {
      kind: 'container', id: 'grid', layout: 'grid', columns: ['auto'],
      ...(rows.length > 0 ? { rows } : {}), children: [cell('a')],
    } as HudGridContainer;
    expect(validateLayout(docOf(grid)).errors).toEqual([]);
  });

  it('prints every extent shape a chip can hold', () => {
    expect(['auto', 'fill', { px: 16 }, { pct: 50 }, { from: 'data', expr: 'w' }].map((t) => trackText(t as Extent)))
      .toEqual(['auto', 'fill', '16px', '50%', 'ƒx']);
  });
});

describe('a grid is insertable from the toolbar, and so is an overlay', () => {
  it('offers Grid and Overlay beside Row and Column - there is no Stack (§42)', () => {
    const inserted: HudNode[] = [];
    const groups = buildToolbarGroups({ insert: (node) => inserted.push(node) });
    const container = menuItems(groups.find((g) => g.key === 'container')?.items ?? []);
    expect(container.map((i) => i.id)).toEqual(['row', 'column', 'overlay', 'grid']);
    container.find((i) => i.id === 'grid')?.onSelect?.();
    expect(inserted[0]).toMatchObject({ kind: 'container', layout: 'grid', columns: ['auto', 'auto'], rows: ['auto', 'auto'] });
  });

  it('the Overlay preset is a 1x1 grid that hugs instead of stretching', () => {
    const inserted: HudNode[] = [];
    const groups = buildToolbarGroups({ insert: (node) => inserted.push(node) });
    menuItems(groups.find((g) => g.key === 'container')?.items ?? []).find((i) => i.id === 'overlay')?.onSelect?.();
    expect(inserted[0]).toMatchObject({
      kind: 'container', layout: 'grid', columns: ['auto'], rows: ['auto'],
      justifyItems: 'start', alignItems: 'start',
    });
    expect(validateLayout(docOf(inserted[0] as HudGridContainer)).errors).toEqual([]);
  });

  it('inserts a grid a validator accepts on its own', () => {
    expect(validateLayout(docOf(newGrid())).errors).toEqual([]);
  });
});
