/* @layer tests @kind test */
// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { gridActions } from '@app/views/HudLayoutEditor/sub-components/GridEditor/behavior/grid-actions';
import { legendEntries } from '@app/views/HudLayoutEditor/sub-components/SelectionLegend';
import type {
  GridSelection,
} from '@app/views/HudLayoutEditor/sub-components/GridEditor/GridEditor.type';
import { actionContext as ctxFor } from './action-context';
import { installGridRig } from './install-grid-rig';
import { screenRoot } from './screen-root';

const { cell, header, down, toolbarKeys, legendCaps, mountGrid } = installGridRig();

describe('one table drives the toolbar and the legend', () => {
  const keysOf = (selection: GridSelection): string[] =>
    gridActions(ctxFor(selection, screenRoot())).map((a) => `${a.kind}:${a.key}`);

  it('offers no action but the pointer gestures when nothing is selected', () => {
    expect(keysOf({ kind: 'none' })).toEqual([
      'gesture:pick', 'gesture:add-to', 'gesture:range', 'gesture:rectangle',
    ]);
  });

  it('offers insertion around a cell range and nothing about whoever is in it', () => {
    const one = { kind: 'cells', cells: [{ column: 2, row: 2 }], anchor: { column: 2, row: 2 } } as const;
    expect(keysOf(one)).toEqual([
      'button:insert-column-before', 'button:insert-column-after',
      'button:insert-row-before', 'button:insert-row-after',
      'gesture:move-cursor', 'gesture:extend', 'gesture:clear',
    ]);
    const over = {
      kind: 'cells' as const,
      cells: [{ column: 1, row: 3 }, { column: 2, row: 3 }],
      anchor: { column: 1, row: 3 },
    };
    expect(keysOf(over)).toEqual(keysOf(one));
  });

  it('offers reorder, insert and remove on a track, but NOT size (§55)', () => {
    expect(keysOf({ kind: 'track', axis: 'columns', indices: [1], anchor: 1 })).toEqual([
      'button:move-earlier', 'button:move-later',
      'button:insert-before', 'button:insert-after', 'button:remove', 'gesture:clear',
    ]);
    const inert = (selection: GridSelection, key: string) => {
      const row = gridActions(ctxFor(selection, screenRoot())).find((a) => a.key === key);
      return [row?.disabled, row?.run, row?.shortcut];
    };
    expect(inert({ kind: 'track', axis: 'columns', indices: [0], anchor: 0 }, 'move-earlier'))
      .toEqual([true, undefined, undefined]);
    expect(inert({ kind: 'track', axis: 'columns', indices: [2], anchor: 2 }, 'move-later'))
      .toEqual([true, undefined, undefined]);
  });

  it('renders exactly the table\'s button and control rows, and nothing else', () => {
    mountGrid();
    const table = gridActions(ctxFor({ kind: 'none' }, screenRoot()));
    expect(toolbarKeys()).toEqual(table.filter((a) => a.kind !== 'gesture').map((a) => a.key));
    down(header('column 2'));
    const picked = gridActions(ctxFor({ kind: 'track', axis: 'columns', indices: [1], anchor: 1 }, screenRoot()));
    expect(toolbarKeys()).toEqual(picked.filter((a) => a.kind !== 'gesture').map((a) => a.key));
  });

  it('draws in the legend every table row that carries a shortcut, and only those', () => {
    mountGrid();
    const check = (selection: GridSelection): void => {
      const expected = legendEntries(gridActions(ctxFor(selection, screenRoot())));
      expect(document.querySelectorAll('.hud-grid__key').length).toBe(expected.length);
      for (const entry of expected) {
        expect(document.querySelector(`.hud-grid__key[data-shortcut="${entry.key}"]`)).not.toBeNull();
      }
    };
    check({ kind: 'none' });
    down(header('column 2'));
    check({ kind: 'track', axis: 'columns', indices: [1], anchor: 1 });
    down(cell(2, 2));
    check({ kind: 'cells', cells: [{ column: 2, row: 2 }], anchor: { column: 2, row: 2 } });
  });

  it('draws the keys as CAPS and the pointer as a MOUSE, not as prose', () => {
    mountGrid();
    expect(document.querySelectorAll('.hud-grid__key .shortcut__cap').length).toBeGreaterThan(0);
    expect(document.querySelectorAll('.hud-grid__key .shortcut__mouse').length).toBe(4);
    expect(legendCaps().join(' ')).toContain('Ctrl');
    expect(document.querySelector('.hud-grid__key .shortcut__mouse--drag')).not.toBeNull();
  });
});
