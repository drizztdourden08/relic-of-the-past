/* @layer tests @kind test */
// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ghostFor } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/behavior/drop-ghost';
import { outlineIntent } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/behavior/drop-intent';
import { DragGhost } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/DragGhost';
import { OutlinePanel } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/OutlinePanel';
import { PlatformContext } from '../../../apps/desktop/src/platform/PlatformProvider';
import type { Platform } from '../../../shared/platform';
import { DOC } from './ghost-doc.constants';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let mounted: { root: Root; host: HTMLElement } | null = null;

const mount = (node: ReactNode): void => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => { root.render(node); });
  mounted = { root, host };
};

afterEach(() => {
  if (!mounted) return;
  const { root, host } = mounted;
  act(() => root.unmount());
  host.remove();
  mounted = null;
  document.querySelector('#portal-root')?.remove();
});

describe('the card itself', () => {
  it('renders nothing at all when nothing is being dragged', () => {
    mount(h(DragGhost, { model: null }));
    expect(document.querySelector('.hud-ghost')).toBeNull();
  });

  it('draws three lines, in order, once the cursor has reported', () => {
    mount(h(DragGhost, { model: ghostFor(DOC, ['magic-bar'], { kind: 'flex', parentId: 'hud', index: 1 }) }));
    act(() => {
      window.dispatchEvent(new MouseEvent('pointermove', { clientX: 200, clientY: 100 }));
    });
    const card = document.querySelector('.hud-ghost');
    expect(card).not.toBeNull();
    expect(card?.querySelector('.hud-ghost__chip')?.textContent).toBe('magic-bar');
    expect(card?.querySelector('.hud-ghost__kind')?.textContent).toBe('into column');
    expect(card?.querySelector('.hud-ghost__l2')?.textContent).toBe('position 2 of 2');
    expect(card?.querySelector('.hud-ghost__l3')?.textContent).toBe('screen › hud');
  });

  it('turns the whole card on a refusal, so the state reads in peripheral vision', () => {
    const intent = outlineIntent(DOC, 'pip1', 'inside-start', ['hearts']);
    mount(h(DragGhost, { model: ghostFor(DOC, ['hearts'], intent) }));
    act(() => {
      window.dispatchEvent(new MouseEvent('pointermove', { clientX: 200, clientY: 100 }));
    });
    expect(document.querySelector('.hud-ghost.is-refused')).not.toBeNull();
  });
});

const ROW = 22;
const PLATFORM = { info: { os: 'windows' } } as unknown as Platform;

const rowsInOrder = (): HTMLElement[] =>
  Array.from(document.querySelectorAll('[data-outline-row]')) as HTMLElement[];

const layOutRows = (): void => {
  rowsInOrder().forEach((row, index) => {
    row.getBoundingClientRect = () => ({
      x: 0, y: index * ROW, width: 200, height: ROW, top: index * ROW, left: 0,
      right: 200, bottom: (index + 1) * ROW, toJSON: () => ({}),
    }) as DOMRect;
  });
  document.elementFromPoint = (_x: number, y: number) => rowsInOrder()[Math.floor(y / ROW)] ?? null;
};

const rowFor = (id: string): { element: HTMLElement; top: number } => {
  const rows = rowsInOrder();
  const index = rows.findIndex((row) => row.dataset.outlineRow === id);
  if (index < 0) throw new Error(`no row for ${id}`);
  return { element: rows[index], top: index * ROW };
};

const pointer = (type: string, y: number): MouseEvent =>
  new MouseEvent(type, { bubbles: true, cancelable: true, clientX: 40, clientY: y });

const dragRow = (from: string, to: string, offset: number): void => {
  layOutRows();
  act(() => { rowFor(from).element.dispatchEvent(pointer('pointerdown', rowFor(from).top + 11)); });
  const target = rowFor(to).top + offset;
  for (const step of [8, 4, 0]) {
    act(() => { window.dispatchEvent(pointer('pointermove', target + step)); });
  }
};

describe('the outline, with a ghost on it', () => {
  const mountOutline = (onDrop: (ids: readonly string[], intent: unknown) => void): void => {
    mount(h(PlatformContext.Provider, { value: PLATFORM }, h(OutlinePanel, {
      doc: DOC,
      selectedId: null,
      slotNumbers: [],
      onSelect: () => {},
      onRemove: () => {},
      onDrop,
    })));
  };

  it('names the container and the position it is promising', () => {
    const onDrop = vi.fn();
    mountOutline(onDrop);
    const lowerHalfOfHeartsMiddleBand = 14;
    dragRow('magic-bar', 'hearts', lowerHalfOfHeartsMiddleBand);
    expect(document.querySelector('.hud-ghost__kind')?.textContent).toBe('into row');
    expect(document.querySelector('.hud-ghost__l2')?.textContent).toBe('position 3 of 3');
    act(() => { window.dispatchEvent(pointer('pointerup', rowFor('hearts').top + 14)); });
    expect(onDrop).toHaveBeenCalledWith(['magic-bar'], { kind: 'flex', parentId: 'hearts', index: 2 });
  });

  it('STOPS SILENTLY SWALLOWING A REFUSED DROP, which is the loop §43 left open', () => {
    const onDrop = vi.fn();
    mountOutline(onDrop);
    dragRow('hud', 'hearts', 14);
    const card = document.querySelector('.hud-ghost.is-refused');
    expect(card).not.toBeNull();
    expect(card?.querySelector('.hud-ghost__l2')?.textContent).toBe('hearts is already inside hud');
    expect(card?.querySelector('.hud-ghost__l3')?.textContent).toBe('screen › hud › hearts');
    expect(document.querySelector('.hud-outline__row.is-drop-inside')).toBeNull();
  });

  it('shows nothing at all before the slop threshold', () => {
    const onDrop = vi.fn();
    mountOutline(onDrop);
    layOutRows();
    act(() => { rowFor('magic-bar').element.dispatchEvent(pointer('pointerdown', rowFor('magic-bar').top + 11)); });
    expect(document.querySelector('.hud-ghost')).toBeNull();
    act(() => { window.dispatchEvent(pointer('pointerup', rowFor('magic-bar').top + 11)); });
    expect(onDrop).not.toHaveBeenCalled();
  });
});
