/* @layer tests @kind test */
/**
 * Phase 7 of `plans/hud-inspector-ux-review.html` covers what the Layout section's
 * new controls WRITE, as opposed to how wide they are (that is
 * `hud-inspector-layout-widths`). Four claims, each of which was a stated hole
 * in the review, not a guess:
 *
 * 1. ONE TILE PER VALUE THE ENGINE REALLY HAS (§56). The 3x3 pad crossed two
 *    POSITIONS, so `between` and `stretch` had no cell and rode beside it as
 *    lone toggles; a row of tiles per axis holds the whole value set, and the
 *    claim asserted here is that the set is EXACTLY the engine's, which is four per
 *    grid axis, six on a flex main axis, three on its cross axis and no flex
 *    `stretch`, because nothing is ever stretched under the flow engine.
 * 2. A TRACK LIST ROUND-TRIPS. Add, size, reorder and remove, then through
 *    `JSON` and `validateLayout` and out into real placed rectangles.
 * 3. THE SCREEN ROOT'S ENGINE CANNOT BE CHANGED THROUGH ANY PATH. `LayoutSection`
 *    took no `isScreen` at all and would rewrite the screen into a grid, while
 *    `SizeBoxSection` had been locking five fields for it all along.
 * 4. THE GUIDE COLOUR REACHES THE OVERLAY. `ColorField` writes `guide.color`
 *    and `ContainerOverlay` draws in it. It is pinned end to end because a previous
 *    pass on this file was found reading the wrong property. Since §57 that
 *    overlay draws a FLEX container too, from its children's own placed slots.
 */
import { describe, expect, it, vi } from 'vitest';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { layoutHud, placedById } from '@shared/hud/engine';
import { validateLayout } from '@shared/hud/layouts';
import { FLEX_ALIGN, FLEX_JUSTIFY, GRID_ITEMS } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/align-options';
import { insertTrack, moveTrack, removeTrack, setTrack, trackText } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/track-extents';
import { newGrid } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/new-node';
import { buildToolbarGroups } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/toolbar-menus';
import { ContainerOverlay } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/ContainerOverlay';
import { LayoutSection } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/sections/LayoutSection';
import { PlatformContext } from '../../apps/web/src/platform/PlatformProvider';
import type { Platform } from '../../shared/platform';
import type { Extent, HudFlexContainer, HudGridContainer, HudLayout, HudNode } from '@shared/types/hud';
import type { PlacedNode } from '@shared/hud/engine';

// The overlay's view flag lives in a zustand store, and zustand serves
// `getInitialState` as the SERVER snapshot, so a `setState` before
// `renderToStaticMarkup` is not seen. The flag is stubbed on instead of
// working around that, because what is under test is the colour, not the
// toggle (`EditorToolbar` owns that and `hud-editor-view-store` pins it).
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

const ED = resolve(__dirname, '../../apps/web/src/ui/domains/app/views/HudLayoutEditor');
const noop = (): void => {};
const VIEW = { w: 400, h: 200 };
// Held in a const instead of written inline: `local/no-raw-color` flags a hex
// literal on a `color` property, and this one is a HUD document's value, not a
// style the app paints with.
const GUIDE = '#12ab34';
// A grid mounts `GridEditor`, whose selection hook asks the platform for the
// modifier key's NAME. Section three is not what these cases are about.
const PLATFORM = { info: { os: 'windows' } } as unknown as Platform;

const cell = (id: string, extra: Partial<HudNode> = {}): HudNode => ({
  kind: 'container', id, direction: 'row', size: { w: { px: 10 }, h: { px: 10 } }, children: [], ...extra,
} as HudNode);

/** The grid under test in the screen's top-left cell - what `anchor:
 *  'top-left'` used to say (§42). */
const docOf = (root: HudGridContainer): HudLayout => ({
  id: 'phase7',
  name: 'Phase 7',
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

describe('the alignment tiles offer the values the engine has, and no others', () => {
  it('lists four per grid axis, six on a flex main axis and three on its cross', () => {
    expect(GRID_ITEMS.map((o) => o.value)).toEqual(['start', 'center', 'end', 'stretch']);
    expect(FLEX_JUSTIFY.map((o) => o.value))
      .toEqual(['start', 'center', 'end', 'between', 'around', 'evenly']);
    // NO FLEX `stretch`. `hud-node.ts` says an element is never stretched under
    // the flow engine and `place-flow.ts` reads a stray `stretch` as `start`, so
    // a tile for it would be a control that does nothing.
    expect(FLEX_ALIGN.map((o) => o.value)).toEqual(['start', 'center', 'end']);
    expect(FLEX_ALIGN.some((o) => o.value === 'stretch')).toBe(false);
  });

  it('renders one tile per value, each naming what it writes', () => {
    const markup = renderToStaticMarkup(h(PlatformContext.Provider, { value: PLATFORM },
      h(LayoutSection, {
        node: { kind: 'container', id: 'row-1', direction: 'row', children: [] },
        onPatch: noop, onPatchNode: noop, scope: {},
      })) as never);
    for (const option of FLEX_JUSTIFY) {
      expect(markup).toContain(`data-align="justify:${option.value}"`);
    }
    for (const option of FLEX_ALIGN) {
      expect(markup).toContain(`data-align="align:${option.value}"`);
    }
    // Nine tiles for a flex container, and not one of them is the grid's.
    expect((markup.match(/data-align="/g) ?? []).length).toBe(9);
    expect(markup).not.toContain('data-align="justifyItems');
    // §55's two orphan toggles are gone with the pad that orphaned them.
    expect(markup).not.toContain('data-action="align-extra"');
  });

  it('turns the flex diagrams with `direction`, because the axes turn with it', () => {
    // THE ONE THING TWO TEXT DROPDOWNS COULD NEVER SHOW, and the reason the
    // rows are called `main` and `cross` instead of `↔` and `↕`: a column's
    // main axis IS the vertical one, so its tiles have to distribute downwards.
    const render = (direction: 'row' | 'column'): string => renderToStaticMarkup(
      h(PlatformContext.Provider, { value: PLATFORM },
        h(LayoutSection, {
          node: { kind: 'container', id: 'f', direction, children: [] },
          onPatch: noop, onPatchNode: noop, scope: {},
        })) as never,
    );
    // `space-between` on the tile, laid out the way the container flows.
    expect(render('row')).toContain('flex-direction:row;justify-content:space-between');
    expect(render('column')).toContain('flex-direction:column;justify-content:space-between');
    // A grid's axes never move, so its tiles never turn. They are a two-cell
    // `display: grid` whichever way anything else is pointing.
    expect(render('row')).not.toContain('grid-template-columns');
  });

  it('draws a grid\'s two fixed axes instead, with stretch among them', () => {
    const markup = renderToStaticMarkup(h(PlatformContext.Provider, { value: PLATFORM },
      h(LayoutSection, {
        node: {
          kind: 'container', id: 'g', layout: 'grid', columns: ['auto'], children: [],
        },
        onPatch: noop, onPatchNode: noop, scope: {},
      })) as never);
    expect(markup).toContain('data-align="justifyItems:stretch"');
    expect(markup).toContain('data-align="alignItems:stretch"');
    expect((markup.match(/data-align="/g) ?? []).length).toBe(8);
  });
});

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
    // Through JSON and the real validator, not straight into the engine: the
    // strip's edits have to survive being saved and read back.
    const parsed = validateLayout(JSON.parse(JSON.stringify(docOf(grid))));
    expect(parsed.errors).toEqual([]);
    const placed = layoutHud(parsed.doc as HudLayout, VIEW, {});
    expect(placedById(placed, 'a')?.rect.x).toBe(0);
    // The 30 px track moved to the front, so the second cell starts at 30.
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

describe('the screen root chooses its engine like any other container (§42)', () => {
  const render = (direction = 'row'): string => renderToStaticMarkup(
    h(PlatformContext.Provider, { value: PLATFORM }, h(LayoutSection, {
      node: { kind: 'container', id: 'screen', direction, children: [] } as never,
      onPatch: noop, onPatchNode: noop, scope: {},
    })) as never,
  );

  it('no longer scrims engine or direction - §38.4\'s lock is lifted', () => {
    // The lock existed only while the screen was a `stack` pretending not to
    // be a grid. A screen that IS a grid has a template worth editing, and
    // locking it would lock the feature.
    const markup = render();
    expect(markup).not.toContain('disabled-overlay');
    expect((markup.match(/disabled=""/g) ?? []).length).toBe(0);
  });

  it('has no `isScreen` left to reason about at all', () => {
    const src = readFileSync(`${ED}/sub-components/sections/LayoutSection.tsx`, 'utf8');
    expect(src).not.toContain('isScreen');
    // Size & Box keeps ITS lock: the screen's rectangle is still not a
    // question it can answer (§29 / §37), which is what §42 did not touch.
    expect(readFileSync(`${ED}/sub-components/NodeInspector.tsx`, 'utf8'))
      .toMatch(/<SizeBoxSection[\s\S]{0,240}?isScreen=\{isScreen\}/);
  });

  it('writes a real engine change through, for the screen like anything else', () => {
    const patches: unknown[] = [];
    const markup = renderToStaticMarkup(h(PlatformContext.Provider, { value: PLATFORM },
      h(LayoutSection, {
        node: { kind: 'container', id: 'screen', direction: 'row', children: [] } as never,
        onPatch: (patch: unknown) => patches.push(patch), onPatchNode: noop, scope: {},
      })) as never);
    expect(markup).toContain('engine');
    // The switch goes through the real CONVERSION (§53). Building a container by
    // hand and handing it to a merging `onPatch` is what left a grid's keys on a
    // flex node and crashed the layout pass; the no-op case ("already that
    // engine writes nothing") is `engineSwitchPatch` returning null, pinned in
    // `hud-engine-switch.keep.test.ts`, not grepped for here.
    const src = readFileSync(`${ED}/sub-components/sections/LayoutSection.tsx`, 'utf8');
    expect(src).toContain('engineSwitchPatch(');
    expect(src).not.toMatch(/const to(Flex|Grid)/);
  });
});

describe('the guide colour reaches the overlay it names', () => {
  it('draws every line and cell in the grid\'s own guide.color', () => {
    const container: HudGridContainer = {
      kind: 'container', id: 'grid', layout: 'grid', columns: [{ px: 20 }, { px: 20 }],
      rows: [{ px: 10 }], guide: { show: true, color: GUIDE },
      children: [cell('a', { place: { column: 1, row: 1 } })],
    };
    const placed: PlacedNode[] = [
      { id: 'grid', node: container, rect: { x: 0, y: 0, w: 40, h: 10 }, scale: 1, opacity: 1, dimmed: false },
      { id: 'a', node: container.children[0], rect: { x: 0, y: 0, w: 10, h: 10 }, scale: 1, opacity: 1, dimmed: false },
    ];
    const markup = renderToStaticMarkup(h(ContainerOverlay, {
      container, placed, scale: 2, ctx: {},
    }) as never);
    expect(markup).toContain(GUIDE);
    // Not the fallback, and not some other key on `guide`.
    expect(markup).not.toContain('#c064c0');
    // Lines come from the SOLVED cells, so the empty second column still gets
    // its boundary - three vertical lines for two columns, at 0, 40 and 80
    // display px (20 px tracks at scale 2). The old child-edge inference
    // could only draw the lines a child happened to touch.
    expect(markup.match(/hud-overlay__line--v/g)).toHaveLength(3);
    expect(markup).toContain('left:40px');
    // And nothing here is a click target: the stage is select-only (§47).
    expect(markup).not.toContain('hud-overlay__cell');
    expect(markup).not.toContain('onClick');
  });

  it('draws a FLEX container\'s child slots, so the gaps between them show (§57)', () => {
    // A row of two 10px children with `gap.x: 2`: the engine places the second
    // at 12, and the overlay draws two outlines at the display scale - 0..20 and
    // 24..44 - with the 4px of daylight between them BEING the gap.
    const container: HudFlexContainer = {
      kind: 'container', id: 'row', direction: 'row', gap: { x: 2, y: 6 },
      guide: { show: true, color: GUIDE },
      children: [cell('a'), cell('b')],
    };
    const placed: PlacedNode[] = [
      { id: 'row', node: container, rect: { x: 0, y: 0, w: 22, h: 10 }, scale: 1, opacity: 1, dimmed: false },
      { id: 'a', node: container.children[0], rect: { x: 0, y: 0, w: 10, h: 10 }, scale: 1, opacity: 1, dimmed: false },
      { id: 'b', node: container.children[1], rect: { x: 12, y: 0, w: 10, h: 10 }, scale: 1, opacity: 1, dimmed: false },
    ];
    const markup = renderToStaticMarkup(h(ContainerOverlay, {
      container, placed, scale: 2, ctx: {},
    }) as never);
    expect(markup.match(/hud-overlay__slot/g)).toHaveLength(2);
    // The container's own guide colour, not the fallback - a flex container has
    // one now, and `convert-engine.ts` no longer drops it.
    expect(markup).toContain(GUIDE);
    expect(markup).not.toContain('#c064c0');
    // INSET BY A PIXEL AND DASHED (§58): §57.8 photographed the first slot's
    // leading edges sitting exactly under the gold selection outline, so the
    // pair read as one box cut down a side. 0..20 becomes 1..19 and 24..44
    // becomes 25..43; the 4px of daylight between them is untouched.
    expect(markup).toContain('left:1px');
    expect(markup).toContain('left:25px');
    expect(markup).toContain('width:18px');
    // And the outline is DASHED, which is the other half of telling it apart
    // from the solid gold selection box. It is checked in the sheet, where the border is.
    expect(readFileSync(`${ED}/sub-components/HudLayoutEditor.inspector.css`, 'utf8'))
      .toMatch(/\.hud-overlay__slot\s*\{[^}]*dashed/);
    // A flex container has no lattice, and nothing here is clickable either.
    expect(markup).not.toContain('hud-overlay__line');
    expect(markup).not.toContain('onClick');
  });
});

describe('a grid is insertable from the toolbar, and so is an overlay', () => {
  it('offers Grid and Overlay beside Row and Column - there is no Stack (§42)', () => {
    const inserted: HudNode[] = [];
    const groups = buildToolbarGroups({ insert: (node) => inserted.push(node) });
    const container = groups.find((g) => g.key === 'container');
    expect(container?.items.map((i) => i.key)).toEqual(['row', 'column', 'overlay', 'grid']);
    container?.items.find((i) => i.key === 'grid')?.onClick?.();
    expect(inserted[0]).toMatchObject({ kind: 'container', layout: 'grid', columns: ['auto', 'auto'], rows: ['auto', 'auto'] });
  });

  it('the Overlay preset is a 1x1 grid that hugs instead of stretching', () => {
    const inserted: HudNode[] = [];
    const groups = buildToolbarGroups({ insert: (node) => inserted.push(node) });
    groups.find((g) => g.key === 'container')?.items.find((i) => i.key === 'overlay')?.onClick?.();
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
