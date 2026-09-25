// @vitest-environment jsdom
/* @layer tests @kind test */
/**
 * §50's grid editor, DRIVEN. The first claim is the bug the amendment was opened
 * for, and it is the one worth the most:
 *
 * 1. A PRESS ON A CELL WRITES NOTHING. A click, a `{mod}`-click, a `Shift`-click
 *    and a drag across cells all leave the document byte-identical. §48 armed a
 *    placement on the selected child, so picking a cell to insert a column
 *    beside it MOVED that child instead. As reported, "clicking a cell actually
 *    moves things around for the child without touching anything else."
 * 2. THERE IS NO CHILD IN THE TABLE AT ALL. No state offers a place, a move, a
 *    span, a clear-span or a self-alignment field, and the component takes no
 *    prop that could write one.
 * 3. ONE TABLE. Every contextual state renders exactly the actions listed for
 *    it, and the legend beneath prints exactly the rows of that same table that
 *    carry a shortcut. It is read off `gridActions` instead of compared against a
 *    second copy of the strings.
 * 4. EACH SHORTCUT DOES WHAT THE LEGEND DRAWS. The keyboard looks its action up
 *    BY the cap the legend prints (`grid-keys.ts`), so this is asserted on the
 *    real presses: `←` reorders, `Del` removes.
 * 5. A `Del` ON AN OCCUPIED COLUMN NOW JUST WORKS, and the children follow it.
 *    §48's refusal is gone, end to end, through the real validator and engine.
 * 6. `Escape` CLEARS THE SELECTION AND LEAVES THE EDITOR UP (§33's dismiss stack
 *    at `popover`), through a real `FullScreenLayer`.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { layoutHud, placedById } from '@shared/hud/engine';
import { validateLayout } from '@shared/hud/layouts';
import { FullScreenLayer } from '../../apps/web/src/ui/design-system/composites/FullScreenLayer';
import { GridEditor } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/GridEditor';
import { gridActions } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/GridEditor/behavior/grid-actions';
import { legendEntries } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/SelectionBands/SelectionLegend';
import { occupantsOf } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/GridLattice';
import { patchNode } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/node-edits';
import { PlatformContext } from '../../apps/web/src/platform/PlatformProvider';
import type { Platform } from '../../shared/platform';
import type { HudGridContainer, HudLayout, HudNode } from '../../shared/types/hud';
import type {
  GridActionContext, GridSelection,
} from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/GridEditor/GridEditor.type';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const ignore = (): void => {};
class NoopResizeObserver { observe = ignore; unobserve = ignore; disconnect = ignore; }
(globalThis as { ResizeObserver?: unknown }).ResizeObserver = NoopResizeObserver;

const EDITOR = resolve(__dirname, '../../apps/web/src/ui/domains/app/views/HudLayoutEditor');
const PLATFORM = { info: { os: 'windows' } } as unknown as Platform;
const VIEW = { w: 398, h: 224 };

const leaf = (id: string, place?: Record<string, number>): HudNode =>
  ({ id, kind: 'element', element: { type: 'spacer' }, size: { w: { px: 16 }, h: { px: 16 } }, ...(place ? { place } : {}) }) as unknown as HudNode;

/** The screen's own root after §42: three bands each way, with the wallet in the
 *  bottom-left one. */
const ROOT = (): HudGridContainer => ({
  kind: 'container', id: 'screen', layout: 'grid',
  columns: ['auto', 'fill', 'auto'], rows: ['auto', 'fill', 'auto'],
  justifyItems: 'start', alignItems: 'start',
  children: [leaf('vitals', { column: 1, row: 1 }), leaf('wallet', { column: 1, row: 3 })],
});

const docOf = (screen: HudGridContainer): HudLayout =>
  ({ id: 'grid-editor', name: 'Grid editor', builtIn: false, screen });

let mounted: { root: Root; host: HTMLElement } | null = null;

const mount = (node: ReactNode): void => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => { root.render(h(PlatformContext.Provider, { value: PLATFORM }, node)); });
  mounted = { root, host };
};

afterEach(() => {
  if (!mounted) return;
  act(() => mounted?.root.unmount());
  mounted.host.remove();
  mounted = null;
  document.querySelector('#portal-root')?.remove();
});

const cell = (column: number, row: number): HTMLElement => {
  const found = document.querySelector<HTMLElement>(`.hud-lattice__cell[data-column="${column}"][data-row="${row}"]`);
  if (!found) throw new Error(`no cell ${column},${row}`);
  return found;
};

const header = (label: string): HTMLElement => {
  const found = Array.from(document.querySelectorAll<HTMLElement>('.hud-lattice__head'))
    .find((el) => (el.getAttribute('aria-label') ?? '').startsWith(label));
  if (!found) throw new Error(`no header ${label}`);
  return found;
};

const down = (el: Element, init: MouseEventInit = {}): void => {
  act(() => { el.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true, ...init })); });
};

const enter = (el: Element): void => {
  act(() => { el.dispatchEvent(new MouseEvent('pointerover', { bubbles: true, cancelable: true })); });
};

const up = (el: Element): void => {
  act(() => { el.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, cancelable: true })); });
};

const press = (key: string, init: KeyboardEventInit = {}): void => {
  const body = document.querySelector('.hud-lattice__body');
  act(() => { body?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })); });
};

const toolbarKeys = (): string[] =>
  Array.from(document.querySelectorAll('.hud-grid__bar [data-action]'))
    .map((el) => (el as HTMLElement).dataset.action ?? '?');

const legendCaps = (): string[] =>
  Array.from(document.querySelectorAll('.hud-grid__key')).map((el) => el.textContent ?? '');

const status = (): string => document.querySelector('.hud-grid__status')?.textContent ?? '';

const ctxFor = (selection: GridSelection, container: HudGridContainer): GridActionContext => ({
  container,
  selection,
  cursor: { column: 1, row: 1 },
  occupants: occupantsOf(container),
  rows: 3,
  edits: { patchContainer: ignore, setSelection: ignore, refuse: ignore },
});

const mountGrid = (onPatchContainer = ignore): void => {
  mount(h(GridEditor, {
    container: ROOT(), scope: {}, onPatchContainer, onSetEngine: ignore,
  }));
};

describe('selecting a cell writes NOTHING, fixing the bug §50 was opened for', () => {
  it('leaves the document byte-identical through click, modifier, shift and drag', () => {
    const patch = vi.fn();
    mountGrid(patch);
    // A plain click.
    down(cell(1, 1));
    // A modifier click on a cell a child stands in, which was §48's "place it here".
    down(cell(2, 2), { ctrlKey: true });
    // A shift extend across the child's own origin.
    down(cell(3, 3), { shiftKey: true });
    // And the one drag: press, travel, release.
    down(cell(1, 1));
    enter(cell(2, 2));
    enter(cell(3, 3));
    up(cell(3, 3));
    expect(patch).not.toHaveBeenCalled();
    // The selection DID change, because that is what a press is for.
    expect(document.querySelectorAll('.hud-lattice__cell[aria-selected="true"]').length).toBe(9);
  });

  it('takes no prop that could write a child, and offers no child row anywhere', () => {
    // Structural, because "it does not move a child" is not provable by a
    // deleted assertion: the capability would return the moment a prop came
    // back, and nothing would notice.
    const src = readFileSync(`${EDITOR}/sub-components/GridEditor/GridEditor.tsx`, 'utf8');
    expect(src).not.toContain('onPatchNode');
    expect(src).not.toContain('activeChildId');
    const table = readFileSync(`${EDITOR}/sub-components/GridEditor/behavior/grid-actions.ts`, 'utf8');
    for (const word of ['patchChild', 'place-active', 'span-occupant', 'clear-span', 'align-self']) {
      expect(`${word} in the table: ${table.includes(word)}`).toBe(`${word} in the table: false`);
    }
    const selection: GridSelection[] = [
      { kind: 'none' },
      { kind: 'cells', cells: [{ column: 1, row: 1 }], anchor: { column: 1, row: 1 } },
      { kind: 'track', axis: 'columns', indices: [0], anchor: 0 },
      { kind: 'track', axis: 'rows', indices: [1], anchor: 1 },
    ];
    for (const sel of selection) {
      const keys = gridActions(ctxFor(sel, ROOT())).map((a) => a.key);
      for (const banned of ['place-active', 'span-occupant', 'move', 'span', 'clear-span', 'align-self', 'occupant-name']) {
        expect(`${sel.kind}/${banned} ${keys.includes(banned)}`).toBe(`${sel.kind}/${banned} false`);
      }
    }
  });

  it('still draws the occupancy, so a track edit\'s blast radius is visible', () => {
    mountGrid();
    expect(Array.from(document.querySelectorAll('.hud-lattice__occupant')).map((el) => el.textContent))
      .toEqual(['vitals', 'wallet']);
    // And it is not a click target: the cell underneath is what the pointer aims
    // at, which is the declaration that keeps the drawing a drawing.
    const sheet = readFileSync(`${EDITOR}/sub-components/GridLattice/HudLayoutEditor.lattice.css`, 'utf8');
    expect(sheet).toMatch(/\.hud-lattice__occupant\s*\{[^}]*pointer-events:\s*none/);
  });
});

describe('one table drives the toolbar and the legend', () => {
  const keysOf = (selection: GridSelection): string[] =>
    gridActions(ctxFor(selection, ROOT())).map((a) => `${a.kind}:${a.key}`);

  // §54: there is no persistent group in the table AT ALL any more. §51 led every
  // state with four property rows; the properties are `GridSettings` now, and the
  // table is actions-on-the-selection plus the legend's gestures, full stop.
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
    // A cell range holding exactly one child's origin used to grow a `span` row.
    const over = {
      kind: 'cells' as const,
      cells: [{ column: 1, row: 3 }, { column: 2, row: 3 }],
      anchor: { column: 1, row: 3 },
    };
    expect(keysOf(over)).toEqual(keysOf(one));
  });

  it('offers reorder, insert and remove on a track, but NOT size (§55)', () => {
    // §54 led this list with `control:extent`, an 81px field in the action
    // strip. The size is the track HEADER's own control now (`TrackHead`), which
    // is both where the extent is already printed and what lets the strip fit one
    // row at the 232px rail.
    expect(keysOf({ kind: 'track', axis: 'columns', indices: [1], anchor: 1 })).toEqual([
      'button:move-earlier', 'button:move-later',
      'button:insert-before', 'button:insert-after', 'button:remove', 'gesture:clear',
    ]);
    // The first column cannot move earlier and the last cannot move later, and
    // the button is DISABLED IN PLACE, not absent: a button that vanishes slides
    // the next one under the cursor. No `run` and no shortcut, so no key fires
    // it and the legend does not promise it.
    const inert = (selection: GridSelection, key: string) => {
      const row = gridActions(ctxFor(selection, ROOT())).find((a) => a.key === key);
      return [row?.disabled, row?.run, row?.shortcut];
    };
    expect(inert({ kind: 'track', axis: 'columns', indices: [0], anchor: 0 }, 'move-earlier'))
      .toEqual([true, undefined, undefined]);
    expect(inert({ kind: 'track', axis: 'columns', indices: [2], anchor: 2 }, 'move-later'))
      .toEqual([true, undefined, undefined]);
  });

  it('renders exactly the table\'s button and control rows, and nothing else', () => {
    mountGrid();
    const table = gridActions(ctxFor({ kind: 'none' }, ROOT()));
    expect(toolbarKeys()).toEqual(table.filter((a) => a.kind !== 'gesture').map((a) => a.key));
    down(header('column 2'));
    const picked = gridActions(ctxFor({ kind: 'track', axis: 'columns', indices: [1], anchor: 1 }, ROOT()));
    expect(toolbarKeys()).toEqual(picked.filter((a) => a.kind !== 'gesture').map((a) => a.key));
  });

  it('draws in the legend every table row that carries a shortcut, and only those', () => {
    mountGrid();
    const check = (selection: GridSelection): void => {
      const expected = legendEntries(gridActions(ctxFor(selection, ROOT())));
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
    // `⇧click · range` was a monospace string; it is a keycap and a lit mouse
    // now, and the modifier's cap says what the platform's own key is.
    expect(document.querySelectorAll('.hud-grid__key .keycap').length).toBeGreaterThan(0);
    expect(document.querySelectorAll('.hud-grid__key .mouse-glyph').length).toBe(4);
    expect(legendCaps().join(' ')).toContain('Ctrl');
    expect(document.querySelector('.mouse-glyph--drag')).not.toBeNull();
  });
});

describe('every shortcut does what the legend draws', () => {
  it('moves a selected column with the arrow on the cap', () => {
    const patch = vi.fn();
    mountGrid(patch);
    down(header('column 2'));
    expect(document.querySelector('.hud-grid__key[data-shortcut="move-earlier"]')?.textContent)
      .toContain('←');
    press('ArrowLeft');
    expect(patch).toHaveBeenCalledTimes(1);
    expect(patch.mock.calls[0][0].columns).toEqual(['fill', 'auto', 'auto']);
  });

  it('removes a column on Del, WITHOUT asking whether a child is in the way', () => {
    const patch = vi.fn();
    mountGrid(patch);
    // Column 1 holds vitals AND the wallet. §48 refused this and named them.
    down(header('column 1'));
    expect(status()).toBe('column 1 of 3 holds vitals, wallet');
    press('Delete');
    expect(patch).toHaveBeenCalledTimes(1);
    const written = patch.mock.calls[0][0] as HudGridContainer;
    expect(written.columns).toEqual(['fill', 'auto']);
    // And the children came with it, onto the track that took its place.
    expect(written.children.map((c) => c.place)).toEqual([
      { column: 1, row: 1 }, { column: 1, row: 3 },
    ]);
  });

  it('refuses only the one structural floor, and says so', () => {
    const patch = vi.fn();
    mount(h(GridEditor, {
      container: { ...ROOT(), columns: ['auto'], children: [] },
      scope: {}, onPatchContainer: patch,
    }));
    down(header('column 1'));
    press('Delete');
    expect(patch).not.toHaveBeenCalled();
    expect(status()).toBe('A grid needs at least one column.');
    expect(toolbarKeys()).toContain('remove');
  });

  const picked = (): number => document.querySelectorAll('.hud-lattice__cell[aria-selected="true"]').length;

  it('collects cells with the primary modifier and extends a rectangle with shift', () => {
    mountGrid();
    down(cell(2, 1));
    expect(picked()).toBe(1);
    down(cell(3, 1), { ctrlKey: true });
    expect(picked()).toBe(2);
    // Shift extends from the anchor the modifier click left behind, so this is
    // column 3 rows 1..3, which is three cells, not the nine a corner-to-corner would be.
    down(cell(3, 3), { shiftKey: true });
    expect(picked()).toBe(3);
  });
});

describe('Escape clears the selection and leaves the editor standing', () => {
  it('answers with the lattice, not with the layer behind it (§33)', () => {
    mount(h(FullScreenLayer, { onClose: ignore, title: 'HUD Layout Editor' },
      h(GridEditor, { container: ROOT(), scope: {}, onPatchContainer: ignore })));
    down(cell(2, 2));
    expect(document.querySelectorAll('.hud-lattice__cell[aria-selected="true"]').length).toBe(1);
    act(() => {
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    });
    expect(document.querySelectorAll('.hud-lattice__cell[aria-selected="true"]').length).toBe(0);
    expect(document.querySelector('.fullscreen-layer')).not.toBeNull();
  });
});

describe('removing an occupied column survives the validator and the engine', () => {
  it('drops the screen\'s first band and lands both children in the new first one', () => {
    let doc = docOf(ROOT());
    const before = layoutHud(validateLayout(doc).doc as HudLayout, VIEW, {});
    expect(placedById(before, 'wallet')?.rect.x).toBe(0);

    mount(h(GridEditor, {
      container: doc.screen as HudGridContainer,
      scope: {},
      onPatchContainer: (patch) => { doc = patchNode(doc, 'screen', patch as Partial<HudNode>); },
    }));
    down(header('column 1'));
    press('Delete');

    const parsed = validateLayout(JSON.parse(JSON.stringify(doc)) as unknown);
    expect(parsed.errors).toEqual([]);
    const placed = layoutHud(parsed.doc as HudLayout, VIEW, {});
    // Two columns left, `fill` then `auto`: both children sit in the `fill` one,
    // which now starts at x = 0 and the wallet is still at the bottom.
    expect(placedById(placed, 'wallet')?.rect).toMatchObject({ x: 0, y: VIEW.h - 16 });
    expect(placedById(placed, 'vitals')?.rect).toMatchObject({ x: 0, y: 0 });
  });
});
