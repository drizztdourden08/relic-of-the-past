/* @layer tests @kind test */
// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { act, createElement as h } from 'react';
import { OutlinePanel } from '../../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/OutlinePanel';
import { DOC } from './keyboard-move.constants';
import { installPanelHarness } from './install-panel-harness';

const { mount } = installPanelHarness();

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
    expect(live()).toBe('');
  });

  it('leaves a bare arrow, and a Shift/Alt one, entirely alone', () => {
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
    expect(labels[0]).toContain('Ctrl');
    expect(labels[0]).toContain('Up arrow');
    expect(labels[3]).toContain('Move into vault');
    expect(labels[3]).toContain('Right arrow');
  });

  it('opens from the KEYBOARD too, which is the whole point of the phase', () => {
    mountOutline();
    press('loose', 'F10', { shiftKey: true });
    expect(items().length).toBeGreaterThan(0);
    act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); });
    expect(items().length).toBe(0);
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
