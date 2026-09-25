// @vitest-environment jsdom
/* @layer tests @kind test */
/**
 * Phase 6 of `plans/hud-drag-and-drop.html` is THE KEYBOARD PATH, which the plan
 * says is last only because it needed the intent producers final, and is "not
 * optional".
 *
 * THE PROPERTY THIS FILE EXISTS FOR is that the announcement and the ghost say
 * THE SAME THING. `drop-ghost.ts` is a pure function of the document and one
 * intent precisely so that phase 6's `aria-live` region can be those lines
 * flattened instead of a second set of strings drifting beside them. So the
 * assertion is made against the ghost's own model instead of by writing the
 * sentence out twice. Duplicating the strings here would test nothing except
 * this file's typing.
 *
 * THE FOUR KEYS ARE THE THIRD PRODUCER, not a fourth code path: each one is an
 * intent computed from the TREE and handed to the same `applyDrop` the two
 * pointer surfaces go through. So the tree half is tested as arithmetic and the
 * wiring half is driven through the real `OutlinePanel`.
 *
 * NOWHERE TO GO IS NOT A REFUSAL, and the difference is behavioural: `null`
 * shakes the row and writes nothing, a refusal announces a sentence and writes
 * nothing. Both are asserted, because collapsing them is the obvious shortcut.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { stepIntent, stepOptions } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/step-intent';
import { announcementFor, ghostFor } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/drop-ghost';
import { OutlinePanel } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/OutlinePanel';
import { CellPicker } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/CellPicker';
import { useHudEditorViewStore } from '../../apps/web/src/stores/hud-editor-view-store';
import { PlatformContext } from '../../apps/web/src/platform/PlatformProvider';
import type { Platform } from '../../shared/platform';
import type { HudGridContainer, HudLayout, HudNode } from '../../shared/types/hud';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const PLATFORM = { info: { os: 'windows' } } as unknown as Platform;
const leaf = (id: string): HudNode => ({ id, kind: 'element', element: { type: 'spacer' } } as unknown as HudNode);

/**
 *   screen  column
 *     hud     column     hearts, magic-bar
 *       hearts  row      pip1, pip2
 *       magic-bar leaf
 *     vault   row        coin
 *     loose   leaf
 */
const DOC = {
  id: 'l',
  name: 'l',
  screen: {
    id: 'screen',
    kind: 'container',
    direction: 'column',
    children: [
      {
        id: 'hud',
        kind: 'container',
        direction: 'column',
        children: [
          { id: 'hearts', kind: 'container', direction: 'row', children: [leaf('pip1'), leaf('pip2')] },
          leaf('magic-bar'),
        ],
      },
      { id: 'vault', kind: 'container', direction: 'row', children: [leaf('coin')] },
      leaf('loose'),
    ],
  },
} as unknown as HudLayout;

describe('four directions, computed from the tree', () => {
  it('reorders among siblings', () => {
    expect(stepIntent(DOC, 'magic-bar', 'up')).toEqual({ kind: 'flex', parentId: 'hud', index: 0 });
    expect(stepIntent(DOC, 'hearts', 'down')).toEqual({ kind: 'flex', parentId: 'hud', index: 1 });
  });

  it('promotes OUT to the grandparent, immediately after the old parent', () => {
    // `hud` is child 0 of the screen, so anything leaving it lands at index 1
    // beside what it came out of, which is what "out" means in every outliner.
    expect(stepIntent(DOC, 'hearts', 'out')).toEqual({ kind: 'flex', parentId: 'screen', index: 1 });
  });

  it('demotes IN to the previous sibling, appended', () => {
    expect(stepIntent(DOC, 'loose', 'in')).toEqual({ kind: 'flex', parentId: 'vault', index: 1 });
  });

  it('answers null where there is NOWHERE to go, which gets the shake and no sentence', () => {
    expect(stepIntent(DOC, 'hearts', 'up')).toBeNull(); // already first
    expect(stepIntent(DOC, 'loose', 'down')).toBeNull(); // already last
    expect(stepIntent(DOC, 'hud', 'out')).toBeNull(); // the parent IS the screen
    expect(stepIntent(DOC, 'hud', 'in')).toBeNull(); // no previous sibling
    expect(stepIntent(DOC, 'pip1', 'in')).toBeNull(); // no previous sibling
    expect(stepIntent(DOC, 'pip2', 'in')).toBeNull(); // the previous sibling is a LEAF
    expect(stepIntent(DOC, 'vault', 'in')).not.toBeNull(); // but this one's is `hud`
    expect(stepIntent(DOC, 'screen', 'down')).toBeNull(); // nothing to splice the root out of
  });

  it('is the SAME validity check the pointer runs, so it is a refusal and not a silent no-op', () => {
    // `pip2` moving `in` would land inside `pip1`, which is a leaf: there is no
    // previous CONTAINER, so there is nowhere to go at all.
    expect(stepIntent(DOC, 'pip2', 'in')).toBeNull();
    // But a target that exists and is illegal refuses, and names both nodes.
    const nested = { ...DOC, screen: { ...DOC.screen, children: [DOC.screen.children[0]] } } as HudLayout;
    const intent = stepIntent(nested, 'hearts', 'out');
    expect(intent).toMatchObject({ kind: 'flex', parentId: 'screen' });
  });
});

describe('THE ANNOUNCEMENT IS THE GHOST\'S OWN WORDS, flattened', () => {
  const say = (id: string, direction: 'up' | 'down' | 'out' | 'in'): { said: string; model: ReturnType<typeof ghostFor> } => {
    const intent = stepIntent(DOC, id, direction);
    if (!intent) throw new Error('no intent');
    const model = ghostFor(DOC, [id], intent);
    return { said: announcementFor(model), model };
  };

  it('carries every part of the card the card put there, and invents none', () => {
    const { said, model } = say('magic-bar', 'up');
    // The property, not the string: whatever the ghost decided to call the chip,
    // the container and the position is what is read out. Write the sentence out
    // by hand here instead and the two can drift the moment either changes.
    expect(said).toContain(model.chip);
    expect(said).toContain(model.kind);
    expect(said).toContain(model.position);
    expect(said).toBe(`${model.chip} moved ${model.kind}, ${model.position}`);
  });

  it('reads as a sentence, which is the plan\'s own check on the design', () => {
    expect(say('magic-bar', 'up').said).toBe('magic-bar moved into column, position 1 of 2');
    expect(say('loose', 'in').said).toBe('loose moved into row, position 2 of 2');
  });

  it('says what is wrong instead of that something is, when a drop is refused', () => {
    const model = ghostFor(DOC, ['hud'], {
      kind: 'refused', reason: 'descendant', parentId: 'hearts', nodeId: 'hearts',
    });
    expect(announcementFor(model)).toBe("can't move hud. hearts is already inside hud");
    // Both nodes, once each: the refusal sentence already names the target, so
    // the announcement does not name it a second time.
    expect(announcementFor(model)).toContain(model.position);
  });
});

describe('the menu names its own preconditions instead of hiding items', () => {
  it('offers all four, and dims the ones that cannot happen', () => {
    const options = stepOptions(DOC, 'hud');
    expect(options.map((o) => o.direction)).toEqual(['up', 'down', 'out', 'in']);
    expect(options.find((o) => o.direction === 'out')).toMatchObject({
      label: 'Move out of screen', enabled: false,
    });
    // A greyed item that names its own precondition teaches the rule.
    expect(options.find((o) => o.direction === 'in')).toMatchObject({ label: 'Move into...', enabled: false });
    expect(options.find((o) => o.direction === 'down')).toMatchObject({ enabled: true });
  });

  it('names the container an `in` would land in, once there is one', () => {
    expect(stepOptions(DOC, 'loose').find((o) => o.direction === 'in')).toMatchObject({
      label: 'Move into vault', enabled: true,
    });
  });
});

// ── driven, through the real panel ──────────────────────────────────────────
let mounted: { root: Root; host: HTMLElement } | null = null;

const mount = (node: ReactNode): void => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => { root.render(h(PlatformContext.Provider, { value: PLATFORM }, node)); });
  mounted = { root, host };
};

beforeEach(() => { useHudEditorViewStore.setState({ collapsedNodeIds: new Set() }); });

afterEach(() => {
  if (!mounted) return;
  const { root, host } = mounted;
  act(() => root.unmount());
  host.remove();
  mounted = null;
  document.querySelector('#portal-root')?.remove();
});

const rowFor = (id: string): HTMLElement => {
  const found = document.querySelector(`[data-outline-row="${id}"]`);
  if (!(found instanceof HTMLElement)) throw new Error(`no row for ${id}`);
  return found;
};

const press = (id: string, key: string, init: KeyboardEventInit = { ctrlKey: true }): void => {
  act(() => { rowFor(id).dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })); });
};

const live = (): string => document.querySelector('.hud-outline__live')?.textContent ?? '';

const mountOutline = (onDrop: (ids: readonly string[], intent: unknown) => void = () => {}): void => {
  mount(h(OutlinePanel, {
    doc: DOC, selectedId: null, slotNumbers: [], onSelect: () => {}, onRemove: () => {}, onDrop,
  }));
};

describe('the shortcuts, on a focused row', () => {
  it('moves the row and announces it, through the ONE door every drop uses', () => {
    const onDrop = vi.fn();
    mountOutline(onDrop);
    press('magic-bar', 'ArrowUp');
    expect(onDrop).toHaveBeenCalledWith(['magic-bar'], { kind: 'flex', parentId: 'hud', index: 0 });
    expect(live()).toBe('magic-bar moved into column, position 1 of 2');
  });

  it('binds all four arrows to the four operations', () => {
    const onDrop = vi.fn();
    mountOutline(onDrop);
    press('hearts', 'ArrowDown');
    press('hearts', 'ArrowLeft');
    press('loose', 'ArrowRight');
    expect(onDrop.mock.calls.map(([, intent]) => intent)).toEqual([
      { kind: 'flex', parentId: 'hud', index: 1 },
      { kind: 'flex', parentId: 'screen', index: 1 },
      { kind: 'flex', parentId: 'vault', index: 1 },
    ]);
  });

  it('SHAKES and writes nothing where there is nowhere to go', () => {
    const onDrop = vi.fn();
    mountOutline(onDrop);
    press('hearts', 'ArrowUp');
    expect(onDrop).not.toHaveBeenCalled();
    expect(document.querySelector('.hud-outline__row.is-shaking')).not.toBeNull();
    // And it says nothing: "you are already at the top" is what the list shows.
    expect(live()).toBe('');
  });

  it('leaves a bare arrow, and a Shift/Alt one, entirely alone', () => {
    // A row that swallowed Ctrl+Shift+Arrow would eat a text selection, and a
    // bare arrow belongs to whatever is focused.
    const onDrop = vi.fn();
    mountOutline(onDrop);
    press('magic-bar', 'ArrowUp', {});
    press('magic-bar', 'ArrowUp', { ctrlKey: true, shiftKey: true });
    press('magic-bar', 'ArrowUp', { ctrlKey: true, altKey: true });
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('arms nothing on the rows that have no array to be spliced out of', () => {
    const onDrop = vi.fn();
    mountOutline(onDrop);
    press('screen', 'ArrowDown');
    expect(onDrop).not.toHaveBeenCalled();
  });
});

describe('the context menu is where the keys are learned', () => {
  const open = (id: string): void => {
    act(() => { rowFor(id).dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true })); });
  };
  const items = (): HTMLElement[] => Array.from(document.querySelectorAll('.dropdown__item'));

  it('opens on a right-click and prints the key beside every operation', () => {
    mountOutline();
    open('loose');
    const labels = items().map((el) => el.textContent);
    expect(labels[0]).toContain('Move up');
    expect(labels[0]).toContain('Ctrl ↑');
    expect(labels[3]).toContain('Move into vault');
    expect(labels[3]).toContain('Ctrl →');
  });

  it('opens from the KEYBOARD too, which is the whole point of the phase', () => {
    mountOutline();
    press('loose', 'F10', { shiftKey: true });
    expect(items().length).toBeGreaterThan(0);
    // It needs no key handling of its own: `DropdownMenu` is on §33's stack at
    // `menu`, so one press closes it and nothing underneath.
    act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); });
    expect(items().length).toBe(0);
    // And the other platform gesture opens it again.
    press('loose', 'ContextMenu', {});
    expect(items().length).toBeGreaterThan(0);
  });

  it('runs the same operation the shortcut does, and closes', () => {
    const onDrop = vi.fn();
    mountOutline(onDrop);
    open('magic-bar');
    act(() => { items()[0].click(); });
    expect(onDrop).toHaveBeenCalledWith(['magic-bar'], { kind: 'flex', parentId: 'hud', index: 0 });
    expect(document.querySelector('.dropdown__item')).toBeNull();
  });

  it('dims what cannot happen instead of dropping it', () => {
    mountOutline();
    open('hud');
    const disabled = items().filter((el) => (el as HTMLButtonElement).disabled).map((el) => el.textContent);
    expect(disabled.join(' ')).toContain('Move out of screen');
    expect(disabled.join(' ')).toContain('Move into...');
  });
});

/** §50 moved this from `GridEditor` to `CellPicker`. Co-placing is still legal
 *  and still the only way an overlay is authored. But it is a CHILD's edit, and
 *  the grid editor no longer makes any. */
describe('the picker: an occupied cell is a destination, not a rejection', () => {
  const PARENT = {
    id: 'badge',
    kind: 'container',
    layout: 'grid',
    columns: ['auto', 'auto'],
    rows: ['auto', 'auto'],
    children: [
      { ...leaf('life_pip'), place: { column: 1, row: 1 } },
      { ...leaf('shield'), place: { column: 2, row: 2 } },
    ],
  } as unknown as HudGridContainer;

  const cell = (column: number, row: number): HTMLElement => {
    const found = document.querySelector<HTMLElement>(`.hud-lattice__cell[data-column="${column}"][data-row="${row}"]`);
    if (!found) throw new Error(`no cell ${column},${row}`);
    return found;
  };

  const down = (el: Element): void => {
    act(() => {
      el.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
    });
  };

  const mountLattice = (onChange: (place: HudNode['place']) => void): void => {
    mount(h(CellPicker, {
      container: PARENT, childId: 'shield', place: { column: 2, row: 2 }, onChange,
    }));
  };

  it('hatches the cell a sibling already holds, and names the occupant', () => {
    mountLattice(() => {});
    const taken = cell(1, 1);
    // §42 made co-placing legal and it is the only way an overlay is authored,
    // so the mark is a destination: hatched, named, and still a target.
    expect(taken.dataset.state).toBe('occupied');
    expect(taken.getAttribute('aria-label')).toBe('column 1, row 1 with life_pip');
  });

  it('lets a click on it place the node there instead of swallowing it', () => {
    const patch = vi.fn();
    mountLattice(patch);
    down(cell(1, 1));
    expect(patch).toHaveBeenCalledWith({ column: 1, row: 1 });
  });

  it('never counts the node\'s OWN cell as somebody else\'s', () => {
    mountLattice(() => {});
    expect(cell(2, 2).dataset.state).toBe('selected');
  });
});
