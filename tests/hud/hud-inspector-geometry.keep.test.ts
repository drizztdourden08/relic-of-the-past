// @vitest-environment jsdom
/* @layer tests @kind test */
/**
 * The BEHAVIOUR half of phases 5 and 6 of `plans/hud-inspector-ux-review.html`.
 * Widths are measured next door in `hud-inspector-geometry-width`; what is
 * pinned here is what each control writes, and what it refuses to write.
 *
 * FOUR CLAIMS, EACH OF WHICH WAS A DECISION, NOT A DETAIL:
 *
 *  1. A node's position IS `margin.left`/`margin.top`, and ONE function writes
 *     it. §37 wrote that rule for the panel field and the stage's
 *     margin nudge, and §47 removed the drag, so the claim is now that the
 *     field is the only writer: asserted functionally (the round trip back to
 *     the origin clears the keys) and structurally (nothing else in the editor
 *     writes those two keys by hand).
 *  2. A limit is cleared by EMPTYING the field, and clearing DELETES the key.
 *     It does not zero it, and `min.w = 0` is a different document. §36.9 could
 *     not implement this and deferred it here.
 *  3. `margin.left`/`margin.top` are read-only in the box model, because
 *     Placement owns them. The asymmetry is the point, so it is asserted.
 *  4. The screen root cannot be given a size through any path the panel offers.
 *
 * The typing tests mount the real components in jsdom and drive a real `input`
 * event through React's own value setter, because "an emptied field deletes the
 * key" is a claim about an event handler, not about markup.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { BoxModelField } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/BoxModelField';
import { MinMaxField } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/MinMaxField';
import { PlacementSection } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/sections/PlacementSection';
import { SizeBoxSection } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/sections/SizeBoxSection';
import { offsetOf, withOffset } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/offset';
import { PlatformContext } from '../../apps/web/src/platform/PlatformProvider';
import type { Platform } from '../../shared/platform';
import type { HudContainer, HudNode } from '../../shared/types/hud';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const EDITOR = resolve(__dirname, '../../apps/web/src/ui/domains/app/views/HudLayoutEditor');
const tsxIn = (dir: string): string[] => readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? tsxIn(join(dir, e.name)) : (e.name.endsWith('.tsx') || e.name.endsWith('.ts') ? [join(dir, e.name)] : [])));

let mounted: { root: Root; host: HTMLElement } | null = null;

const PLATFORM = { info: { os: 'windows' } } as unknown as Platform;

// Placement mounts the parent's own `GridEditor` (§48) and every modifier in it
// goes through `isPrimaryModifier`, which asks the platform what the primary
// modifier IS, so the provider is part of the chain now, not scenery.
const mount = (node: ReactNode): void => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => { root.render(h(PlatformContext.Provider, { value: PLATFORM }, node)); });
  mounted = { root, host };
};

afterEach(() => {
  if (!mounted) return;
  const { root, host } = mounted;
  act(() => root.unmount());
  host.remove();
  mounted = null;
});

const field = (label: string): HTMLInputElement => {
  const el = document.querySelector(`[aria-label="${label}"]`);
  if (!el) throw new Error(`no field labelled "${label}"`);
  return el as HTMLInputElement;
};

/** A real keystroke: React listens for `input`, and only its own value setter
 *  gets past the controlled-value cache. */
const type = (label: string, text: string): void => {
  const input = field(label);
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  act(() => {
    setter?.call(input, text);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

const FLEX_PARENT = {
  id: 'row', kind: 'container', direction: 'row', children: [],
} as unknown as HudContainer;

/** The screen's own default template (§42) - three bands each way, which is
 *  what the nine anchors turned into. */
const GRID_PARENT = {
  id: 'screen',
  kind: 'container',
  layout: 'grid',
  columns: ['auto', 'fill', 'auto'],
  rows: ['auto', 'fill', 'auto'],
  children: [{ id: 'n', kind: 'element', element: { type: 'spacer' }, place: { column: 1, row: 3 } }],
} as unknown as HudContainer;

const node = (extra: Partial<HudNode> = {}): HudNode =>
  ({ id: 'n', kind: 'element', element: { type: 'spacer' }, ...extra }) as HudNode;

describe('a position is margin.left / margin.top, in one place', () => {
  it('reads an unset margin as the origin and writes zero back as absence', () => {
    expect(offsetOf(undefined)).toEqual({ x: 0, y: 0 });
    expect(offsetOf({ left: -12, top: 4, right: 2 })).toEqual({ x: -12, y: 4 });
    // Zero means "wherever the parent put it", which is what an unset margin
    // already means, so it deletes instead of writing a literal 0.
    expect(withOffset({ left: -12, right: 2 }, { x: 0, y: 0 })).toEqual({ right: 2 });
    expect(withOffset(undefined, { x: 0, y: 0 })).toBeUndefined();
  });

  it('keeps the other two edges, and keeps negatives', () => {
    expect(withOffset({ right: 2, bottom: 3 }, { x: -12, y: -1 }))
      .toEqual({ right: 2, bottom: 3, left: -12, top: -1 });
  });

  it('clears both keys when the field is typed back to the origin', () => {
    // §37 asserted here that the stage's `nudged` and the panel's `withOffset`
    // composed to the same write. §47 removed the stage's drag and `nudged` with
    // it, so what is left to pin is the surviving writer's own round trip: out
    // to a position and back to the origin leaves the document as it was found.
    const margin = { left: 4, top: 4, right: 9 };
    expect(withOffset(margin, { x: 12, y: -4 })).toEqual({ left: 12, top: -4, right: 9 });
    expect(withOffset(margin, { x: 0, y: 0 })).toEqual({ right: 9 });
  });

  it('is the only writer of those two keys in the editor', () => {
    // A second hand-written `margin.left` anywhere would be exactly the drift
    // the one-function rule exists to prevent.
    const offenders = tsxIn(EDITOR)
      .filter((f) => !f.endsWith(`behavior${'/'}offset.ts`) && !f.endsWith('offset.ts'))
      .filter((f) => /margin\.(left|top)\s*=/.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('routes its one remaining writer through that one module', () => {
    const reads = (f: string): string => readFileSync(join(EDITOR, f), 'utf8');
    expect(reads('sub-components/OffsetField.tsx')).toContain("from '../behavior/offset'");
    // §44 moved the stage's writer into a gesture hook when the drag grew a
    // second meaning, §46 put it back in `StageSelection`, and §47 removed the
    // drag outright, so the field is the only writer left. The grep above is
    // what still matters: it is what stops a second one appearing unnoticed.
    expect(reads('sub-components/StageSelection.tsx')).not.toMatch(/from '\.\.\/behavior\/offset'/);
  });
});

describe('the placement section', () => {
  it('no longer offers `order`, because the outline is the ordering control', () => {
    // Its prose still explains WHY, which is the point of deleting a control
    // instead of dropping it unannounced; what may not come back is the field.
    const src = readFileSync(join(EDITOR, 'sub-components/sections/PlacementSection.tsx'), 'utf8');
    expect(src).not.toContain('node.order');
    expect(src).not.toContain('label="order"');
    expect(src).not.toContain('onPatch({ order');
  });

  it('moves a band by writing its CELL - the same patch every grid child gets', () => {
    // §42 retired the nine-anchor `Select` and `setRegionAnchor` with it: a
    // former region is an ordinary child of the screen's grid, so "move the
    // wallet" is `place`, through the one `onPatch` the whole panel uses. §50
    // put the gesture back on the CHILD's own control (`CellPicker`), and the grid
    // editor beside it no longer writes a child at all.
    const onPatch = vi.fn();
    mount(h(PlacementSection, {
      node: node(), parent: GRID_PARENT, onPatch,
    }));
    const cell = document.querySelector('.hud-lattice__cell[data-column="3"][data-row="1"]');
    expect(cell).not.toBeNull();
    act(() => { cell?.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true })); });
    expect(onPatch).toHaveBeenCalledWith({ place: { column: 3, row: 1 } });
  });

  it('states the reason on the cell group and offers the way out of it', () => {
    mount(h(PlacementSection, {
      node: node(), parent: FLEX_PARENT, onPatch: () => {}, onSelectNode: () => {},
    }));
    const scrim = document.querySelector('.disabled-overlay__scrim');
    expect(scrim?.textContent).toContain('flex row');
    expect(scrim?.textContent).toContain("Open the parent's Layout");
    // The control stays VISIBLE under it, because a property that vanishes when you
    // flip a switch is one you stop trusting.
    expect(document.querySelector('.hud-lattice__cell')).not.toBeNull();
  });

  it('offers no anchor dropdown at all - there are no nine anchors left (§42)', () => {
    mount(h(PlacementSection, { node: node(), parent: null, onPatch: () => {} }));
    expect(Array.from(document.querySelectorAll('.field__label')).map((l) => l.textContent))
      .not.toContain('anchor');
  });

  it('splits self-alignment into two axes under a grid, and one under flex', () => {
    // `alignSelf` speaks for both axes when it is alone; `justifySelf` beside
    // it takes the inline one back, which is what a corner cell needs to say.
    // §48 moved the pair into the lattice's own toolbar; §50 brought it back
    // here, because it is the CHILD's property and the grid editor stopped
    // writing children altogether.
    mount(h(PlacementSection, { node: node(), parent: GRID_PARENT, onPatch: () => {} }));
    const labels = () => Array.from(document.querySelectorAll('.field__label')).map((l) => l.textContent);
    // Shorter words than §42.4's, on purpose: the child's own name is in the
    // section heading, so "self" was saying what the context already said. And
    // at the 220px rail minimum the old self-alignment label wrapped.
    expect(labels()).toContain('align down');
    expect(labels()).toContain('align across');
    act(() => {
      mounted?.root.render(h(PlatformContext.Provider, { value: PLATFORM }, h(PlacementSection, {
        node: node(), parent: FLEX_PARENT, onPatch: () => {},
      })));
    });
    expect(labels()).toContain('align self');
    expect(labels()).not.toContain('align across');
  });
});

describe('a limit is cleared by emptying the field', () => {
  it('DELETES the key instead of zeroing it', () => {
    const onMin = vi.fn();
    mount(h(MinMaxField, { min: { w: 8, h: 4 }, max: undefined, onMin, onMax: () => {}, scope: {} }));
    type('min w', '');
    expect(onMin).toHaveBeenCalledTimes(1);
    const next = onMin.mock.calls[0][0] as Record<string, unknown>;
    expect(next).toEqual({ h: 4 });
    // Not `{ w: undefined, h: 4 }`, because a key that is present and undefined
    // survives a JSON round trip as a key.
    expect('w' in next).toBe(false);
  });

  it('drops the whole group when its last axis is emptied', () => {
    const onMax = vi.fn();
    mount(h(MinMaxField, { min: undefined, max: { h: 40 }, onMin: () => {}, onMax, scope: {} }));
    type('max h', '');
    expect(onMax).toHaveBeenCalledWith(undefined);
  });

  it('brings a limit into existence by typing into an empty field', () => {
    const onMin = vi.fn();
    mount(h(MinMaxField, { min: undefined, max: undefined, onMin, onMax: () => {}, scope: {} }));
    expect(field('min h').value).toBe('');
    expect(field('min h').getAttribute('placeholder')).toBe('min');
    type('min h', '12');
    expect(onMin).toHaveBeenCalledWith({ h: 12 });
  });
});

describe('the box model', () => {
  it('shows margin left and top, and refuses to edit them', () => {
    mount(h(BoxModelField, {
      margin: { left: -12, top: 2, right: 3 }, padding: undefined,
      centre: '80 × 24', onMargin: () => {}, onPadding: () => {},
    }));
    expect(field('margin left').value).toBe('-12');
    expect(field('margin left').readOnly).toBe(true);
    expect(field('margin top').readOnly).toBe(true);
    // The asymmetry, stated: the other two edges are ordinary fields.
    expect(field('margin right').readOnly).toBe(false);
    expect(field('margin bottom').readOnly).toBe(false);
    expect(field('margin left').title).toContain('Position');
  });

  it('clears an edge by emptying it, like every other optional number here', () => {
    const onPadding = vi.fn();
    mount(h(BoxModelField, {
      margin: undefined, padding: { top: 2, right: 2 },
      centre: 'auto × auto', onMargin: () => {}, onPadding,
    }));
    type('padding top', '');
    expect(onPadding).toHaveBeenCalledWith({ right: 2 });
  });

  it('accepts a negative margin one keystroke at a time', () => {
    const onMargin = vi.fn();
    mount(h(BoxModelField, {
      margin: undefined, padding: undefined,
      centre: 'auto × auto', onMargin, onPadding: () => {},
    }));
    // A lone `-` is not a number yet and must not commit, or a negative margin
    // could never be typed, which is most of what a margin is for.
    type('margin right', '-');
    expect(onMargin).not.toHaveBeenCalled();
    type('margin right', '-8');
    expect(onMargin).toHaveBeenCalledWith({ right: -8 });
  });
});

describe('the screen root cannot be given a size through any path', () => {
  const mountScreen = (): void => {
    mount(h(SizeBoxSection, {
      node: node({ id: 'screen', kind: 'container', direction: 'row', children: [] } as Partial<HudNode>),
      onPatch: () => {}, scope: {}, isScreen: true,
    }));
  };

  it('covers size and limits with one scrim that states the cause', () => {
    mountScreen();
    const scrim = document.querySelector('.disabled-overlay__scrim');
    expect(scrim?.textContent).toContain('always exactly the view');
    const covered = document.querySelector('.disabled-overlay__content');
    expect(covered?.hasAttribute('inert')).toBe(true);
    // Everything a size could be written through is INSIDE that subtree.
    expect(covered?.querySelector('[aria-label="w value"], [aria-label="w unit is auto"]')).not.toBeNull();
    expect(covered?.querySelector('[aria-label="min w"]')).not.toBeNull();
  });

  it('locks all four margin edges and the scale, and leaves padding alone', () => {
    mountScreen();
    for (const side of ['top', 'right', 'bottom', 'left']) {
      expect(`margin ${side} ${field(`margin ${side}`).readOnly}`).toBe(`margin ${side} true`);
      expect(`padding ${side} ${field(`padding ${side}`).readOnly}`).toBe(`padding ${side} false`);
    }
    expect(field('scale').readOnly).toBe(true);
  });

  it('leaves an ordinary node every one of those fields live', () => {
    mount(h(SizeBoxSection, { node: node(), onPatch: () => {}, scope: {} }));
    expect(document.querySelector('.disabled-overlay__scrim')).toBeNull();
    expect(field('margin right').readOnly).toBe(false);
    expect(field('scale').readOnly).toBe(false);
  });
});
