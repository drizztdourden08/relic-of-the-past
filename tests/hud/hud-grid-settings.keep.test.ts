// @vitest-environment jsdom
/* @layer tests @kind test */
/**
 * §55's THREE SECTIONS, DRIVEN, with the guarantees §51 and §54 won re-pinned
 * against a completely different arrangement so that none of them was silently
 * spent buying the new one.
 *
 * WHAT SURVIVES FROM §54, UNCHANGED IN SUBSTANCE:
 *
 * 1. THE PROPERTY SECTIONS ARE BYTE-IDENTICAL in all four selection states.
 *    The HTML matches, reached the way a person reaches it; a check that the
 *    same controls are present would not do. Sections one and two are outside
 *    `GridEditor` entirely now, which makes this stronger than it was, not weaker.
 * 2. AND THEY CANNOT READ A SELECTION: grepped, because a capability comes back
 *    the moment a prop does.
 * 3. THE TOOLBAR HOLDS NO PROPERTY IN ANY STATE, asserted BY NAME, and has no
 *    FIELD of any kind, which is what §55 added and what makes it one row.
 *
 * WHAT IS NEW IN §55:
 *
 * 4. ADD COLUMN AND ADD ROW ARE THE LATTICE'S OWN TRAILING `+`s, and they still
 *    go through the one document rule with the children remapped.
 * 5. THE SELECTED TRACK'S SIZE IS ITS OWN HEADER, and the menu writes the extent.
 * 6. THE GUIDE COLOUR IS A SWATCH WITH NO HEX BOX BESIDE IT; the picker it opens
 *    is where the hex lives.
 *
 * AND WHAT §56 CHANGED, with the same guarantees asked of a fourth arrangement:
 *
 * 7. THE GAP IS AN ORDINARY `ValueField`. "what the hell. we already have a
 *    numbered input.... we don't need a new one." `StepNumberInput` is deleted,
 *    along with the rule that hid the spinner it already had; the editor's step
 *    reaches the field as a CONTEXT default (`hud-editor-step.keep.test.ts`).
 * 8. SECTION ONE IS THE TYPE, THE GAP AND THE OVERLAY. Nothing in it is specific to
 *    either engine, and every piece carries a visible label again. The
 *    alignment component is section TWO's, where the specifics live.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { useHudEditorViewStore } from '../../apps/web/src/stores/hud-editor-view-store';
import { EditorStepContext } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/editor-step';
import { LayoutSection } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/sections/LayoutSection';
import { PlatformContext } from '../../apps/web/src/platform/PlatformProvider';
import type { Platform } from '../../shared/platform';
import type { HudContainer, HudGridContainer, HudNode, Value } from '../../shared/types/hud';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const ignore = (): void => {};
class NoopResizeObserver { observe = ignore; unobserve = ignore; disconnect = ignore; }
(globalThis as { ResizeObserver?: unknown }).ResizeObserver = NoopResizeObserver;

const SUB = resolve(__dirname, '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components');
const PLATFORM = { info: { os: 'windows' } } as unknown as Platform;

const leaf = (id: string, place: Record<string, number>): HudNode =>
  ({ id, kind: 'element', element: { type: 'spacer' }, size: { w: { px: 16 }, h: { px: 16 } }, place }) as unknown as HudNode;

const ROOT = (gap?: HudGridContainer['gap']): HudGridContainer => ({
  kind: 'container', id: 'screen', layout: 'grid',
  columns: ['auto', 'fill', 'auto'], rows: ['auto', 'fill', 'auto'],
  justifyItems: 'start', alignItems: 'start',
  guide: { show: true, color: '#c064c0' },
  ...(gap ? { gap } : {}),
  children: [leaf('vitals', { column: 1, row: 1 }), leaf('wallet', { column: 1, row: 3 })],
});

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
  act(() => { useHudEditorViewStore.setState({ editorStep: 1 }); });
});

const mountGrid = (
  patch: (next: Partial<HudGridContainer>) => void = ignore,
  container: HudGridContainer = ROOT(),
): void => {
  mount(h(LayoutSection, {
    node: container as unknown as HudContainer,
    onPatch: patch as (next: Partial<HudContainer>) => void,
    scope: {},
  }));
};

const pick = <T extends HTMLElement>(selector: string): T => {
  const found = document.querySelector<T>(selector);
  if (!found) throw new Error(`no ${selector}`);
  return found;
};

const cell = (column: number, row: number): HTMLElement =>
  pick(`.hud-lattice__cell[data-column="${column}"][data-row="${row}"]`);

const header = (label: string): HTMLElement => {
  const found = Array.from(document.querySelectorAll<HTMLElement>('.hud-lattice__head'))
    .find((el) => (el.getAttribute('aria-label') ?? '').startsWith(label));
  if (!found) throw new Error(`no header ${label}`);
  return found;
};

const down = (el: Element, init: MouseEventInit = {}): void => {
  act(() => { el.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true, ...init })); });
};

const click = (el: Element | null | undefined): void => {
  act(() => { (el as HTMLElement | null)?.click(); });
};

/** The two property sections, as one string. This is what may not change on a press. */
const properties = (): string =>
  Array.from(document.querySelectorAll('.hud-subsec'))
    .filter((el) => !el.querySelector('.hud-grid'))
    .map((el) => el.innerHTML).join('|');

const bar = (): HTMLElement => pick('.hud-grid__bar');

const field = (label: string): HTMLInputElement => pick(`[aria-label="${label}"]`);

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

/** `Enter` is the formula's own commit. Blur is the other one, but it defers to
 *  the completion menu, which a half-typed name has open. */
const enter = (label: string): void => {
  act(() => {
    field(label).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
  });
};

/** The four states, reached the way a person reaches them. */
const STATES: Readonly<Record<string, () => void>> = {
  none: ignore,
  cell: () => down(cell(2, 2)),
  column: () => down(header('column 2')),
  row: () => down(header('row 2')),
};

describe('the property sections cannot change, because they cannot see a selection', () => {
  it('renders byte-identical markup with nothing, a cell, a column and a row picked', () => {
    mountGrid();
    const expected = properties();
    // The baseline is itself an assertion: if the sections ever stop holding the
    // pad, two steppers, the tenth value, the guide and the overlay, both halves
    // of this test go vacuous.
    expect(Array.from(document.querySelectorAll('.hud-subsec__title')).map((el) => el.textContent))
      // FOUR SECTIONS SINCE §58, one concern each. `Flow` is absent under a
      // grid because a grid has no flow. An absent SECTION is fine; what the
      // rule forbids is a piece appearing and disappearing INSIDE one.
      .toEqual(['Container', 'Alignment', 'Grid manipulation']);
    expect(expected).toContain('aria-label="gap x"');
    expect(expected).toContain('data-action="grid-overlay"');
    expect(expected).toContain('data-engine="grid"');
    expect(expected).toContain('data-align="justifyItems:stretch"');
    for (const [name, select] of Object.entries(STATES)) {
      select();
      expect(`${name} ${properties()}`).toBe(`${name} ${expected}`);
    }
  });

  it('is handed no selection, and has no prop that could carry one', () => {
    // Structural, for §50.1's reason: "it does not read the selection" is not
    // provable by a deleted assertion, because the capability returns the moment a prop
    // does, and nothing else notices.
    for (const file of ['LayoutSettings.tsx', 'LayoutSettings.type.ts', 'FlowSettings.tsx', 'AlignmentTiles.tsx']) {
      const src = readFileSync(`${SUB}/${file}`, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
      for (const word of ['selection', 'Selection', 'cursor', 'occupants', 'GridActionContext']) {
        expect(`${word} in ${file}: ${src.includes(word)}`).toBe(`${word} in ${file}: false`);
      }
    }
  });

  it('boxes nothing, and leads with the type (§56)', () => {
    // "stop putting container with border everywhere" survives §56's labels:
    // each is the section's own text beside its control, never a `Field`
    // wrapper drawn round one. WHAT section one holds, and that it holds the
    // same thing under either engine, is `hud-layout-section-one.keep.test.ts`.
    mountGrid();
    expect(pick('.hud-subsec').querySelectorAll('.field__label').length).toBe(0);
    const body = pick('.hud-subsec__body');
    expect(body.firstElementChild?.className).toContain('hud-layout-set');
    expect(pick('.hud-layout-set').firstElementChild?.querySelector('[data-engine]'))
      .not.toBeNull();
  });
});

describe('the toolbar is the selection\'s, and holds no property and no field', () => {
  const PROPERTIES = ['engine', 'guide', 'grid-overlay', 'add-column', 'add-row', 'align-extra'];

  it('has no property and no input in any of the four states', () => {
    mountGrid();
    for (const [name, select] of Object.entries(STATES)) {
      select();
      const inside = Array.from(bar().querySelectorAll('[data-action]'))
        .map((el) => (el as HTMLElement).dataset.action ?? '?');
      for (const banned of PROPERTIES) {
        expect(`${name}/${banned} in the toolbar: ${inside.includes(banned)}`)
          .toBe(`${name}/${banned} in the toolbar: false`);
      }
      expect(bar().querySelector('[data-engine]')).toBeNull();
      expect(bar().querySelector('.color-swatch')).toBeNull();
      // §55's own addition: NO field either. The extent control was the last one
      // and it is what made the strip two rows deep at 232.
      expect(`${name} inputs ${bar().querySelectorAll('input, .field').length}`)
        .toBe(`${name} inputs 0`);
    }
  });

  it('names what it is acting on, and prints a hint when it is acting on nothing', () => {
    mountGrid();
    const chip = (): string | null => bar().querySelector('.hud-grid__bar-chip')?.textContent ?? null;
    expect(chip()).toBeNull();
    expect(bar().querySelector('.hud-grid__bar-hint')?.textContent)
      .toBe('select a cell, column or row');
    down(header('column 2'));
    expect(chip()).toBe('column 2');
    down(cell(1, 1));
    down(cell(3, 1), { shiftKey: true });
    expect(chip()).toBe('3 cells');
    expect(bar().querySelector('.hud-grid__bar-hint')).toBeNull();
  });

  it('offers only the selection\'s own actions, and size is not among them', () => {
    mountGrid();
    const keys = (): string[] => Array.from(bar().querySelectorAll('[data-action]'))
      .map((el) => (el as HTMLElement).dataset.action ?? '?');
    expect(keys()).toEqual([]);
    down(cell(2, 2));
    expect(keys()).toEqual([
      'insert-column-before', 'insert-column-after', 'insert-row-before', 'insert-row-after',
    ]);
    down(header('column 2'));
    expect(keys()).toEqual(['move-earlier', 'move-later', 'insert-before', 'insert-after', 'remove']);
  });
});

describe('the tracks are edited on the drawing they belong to', () => {
  it('appends a column and a row from the lattice\'s own trailing `+`s', () => {
    const patch = vi.fn();
    mountGrid(patch);
    click(pick('.hud-lattice__add--columns'));
    expect(patch).toHaveBeenLastCalledWith(expect.objectContaining({
      columns: ['auto', 'fill', 'auto', 'auto'],
    }));
    click(pick('.hud-lattice__add--rows'));
    expect(patch).toHaveBeenLastCalledWith(expect.objectContaining({
      rows: ['auto', 'fill', 'auto', 'auto'],
    }));
    // The patch still carries BOTH halves of the rule's answer, and an append
    // changes no address, so the children come back exactly as they were (§50.3).
    expect((patch.mock.calls[1][0].children as HudNode[]).map((c) => c.place))
      .toEqual([{ column: 1, row: 1 }, { column: 1, row: 3 }]);
  });

  it('turns the SELECTED header\'s own label into its size menu', () => {
    const patch = vi.fn();
    mountGrid(patch);
    // Unselected, the header prints its extent and offers no control.
    expect(header('column 2').querySelector('[data-action="size"]')).toBeNull();
    expect(header('column 2').textContent).toBe('fill');
    down(header('column 2'));
    const size = header('column 2').querySelector<HTMLElement>('[data-action="size"]');
    expect(size?.textContent).toBe('fill▾');
    click(size);
    click(Array.from(document.querySelectorAll('.dropdown__item'))
      .find((el) => (el.textContent ?? '').startsWith('px')));
    expect(patch).toHaveBeenLastCalledWith(expect.objectContaining({
      columns: ['auto', { px: 0 }, 'auto'],
    }));
  });

  it('inserts from the toolbar through the same document rule', () => {
    const patch = vi.fn();
    mountGrid(patch);
    down(header('column 2'));
    click(bar().querySelector('[data-action="insert-before"]'));
    expect(patch).toHaveBeenCalledTimes(1);
    expect(patch.mock.calls[0][0].columns).toEqual(['auto', 'auto', 'fill', 'auto']);
  });
});

describe('the gap is the numeric input this panel already had (§56)', () => {
  it('is a `ValueField` with its own spinner, and no second control around it', () => {
    // "what the hell. we already have a numbered input.... we don't need a new
    // one." `StepNumberInput`'s wrapper is deleted, and so is the rule that hid
    // the spinner `ValueInput` has had since §36.
    const patch = vi.fn();
    mountGrid(patch, ROOT({ x: 2, y: 2 }));
    expect(document.querySelector('.hud-step')).toBeNull();
    expect(field('gap x').closest('.hud-value-field')).not.toBeNull();
    click(pick('[aria-label="Increment gap x"]'));
    expect(patch).toHaveBeenLastCalledWith({ gap: { x: 3, y: 2 } });
  });

  it('moves by the editor\'s step when the View says so', () => {
    // The step is a CONTEXT default now instead of a prop threaded down, so
    // the case has to stand in for the View that provides it.
    const patch = vi.fn();
    mount(h(EditorStepContext.Provider, { value: 4 }, h(LayoutSection, {
      node: ROOT({ x: 2, y: 2 }) as unknown as HudContainer,
      onPatch: patch as (next: Partial<HudContainer>) => void,
      scope: {},
    })));
    click(pick('[aria-label="Increment gap x"]'));
    expect(patch).toHaveBeenLastCalledWith({ gap: { x: 6, y: 2 } });
    click(pick('[aria-label="Decrement gap y"]'));
    // Clamped at the floor instead of going negative, because a gap cannot be.
    expect(patch).toHaveBeenLastCalledWith({ gap: { x: 2, y: 0 } });
  });

  it('writes a literal typed into one axis and leaves the other alone', () => {
    const patch = vi.fn();
    mountGrid(patch, ROOT({ x: 2, y: 2 }));
    expect(field('gap x').value).toBe('2');
    type('gap x', '6');
    expect(patch).toHaveBeenCalledWith({ gap: { x: 6, y: 2 } });
  });

  it('writes a formula on commit, exactly as any other ValueInput does', () => {
    const patch = vi.fn();
    mountGrid(patch, ROOT({ x: 2, y: 2 }));
    type('gap y', '= life_current');
    expect(patch).not.toHaveBeenCalled();
    enter('gap y');
    expect(patch).toHaveBeenCalledWith({ gap: { x: 2, y: { from: 'data', expr: 'life_current' } } });
  });

  it('shows a stored expression back with its marker, and drops the spinner', () => {
    const bound: Value = { from: 'data', expr: 'ceil(life_max / 8)' };
    mountGrid(ignore, ROOT({ x: bound, y: 0 }));
    expect(field('gap x').value).toBe('= ceil(life_max / 8)');
    expect(field('gap x').closest('.hud-value-input')?.getAttribute('data-formula')).toBe('true');
    // There is nothing to step in a formula, so no spinner is drawn for it.
    expect(document.querySelector('[aria-label="Increment gap x"]')).toBeNull();
  });
});

describe('every other property still writes what §50 said it wrote', () => {
  it('flips the engine from section ONE\'s own pair (§56)', () => {
    const patch = vi.fn();
    mountGrid(patch);
    click(pick('.hud-layout-set [data-engine="flex"]'));
    expect(patch).toHaveBeenCalledWith(expect.objectContaining({ layout: 'flex' }));
  });

  it('writes exactly its own value from each tile, in every selection state', () => {
    // EVERY TILE, not one of them: the pad this replaces had nine cells and two
    // orphan toggles, and the thing that goes wrong when a table of options is
    // rebuilt is one entry writing its neighbour's value.
    const patch = vi.fn();
    mountGrid(patch);
    for (const select of Object.values(STATES)) {
      select();
      for (const value of ['start', 'center', 'end', 'stretch']) {
        patch.mockClear();
        click(document.querySelector(`[data-align="justifyItems:${value}"]`));
        // ONE KEY, ITS OWN. A tile writes the axis it is on and leaves the
        // other axis's stored value alone, which the 3x3 pad could not do. It
        // wrote both on every press, because a cell IS a pair.
        expect(patch).toHaveBeenCalledWith({ justifyItems: value });
        patch.mockClear();
        click(document.querySelector(`[data-align="alignItems:${value}"]`));
        expect(patch).toHaveBeenCalledWith({ alignItems: value });
      }
    }
  });

  it('opens the guide picker from a bare swatch with no hex box beside it', () => {
    mountGrid();
    const swatch = pick<HTMLElement>('.hud-layout-set__overlay .color-swatch');
    expect(swatch.getAttribute('aria-label')).toBe('Open the guide colour picker');
    // "the color picker DO NOT need a separate input when we have a color picker
    // component that already has it."
    expect(document.querySelector('[aria-label="guide hex"]')).toBeNull();
    click(swatch);
    expect(document.querySelector('.color-picker')).not.toBeNull();
  });
});
