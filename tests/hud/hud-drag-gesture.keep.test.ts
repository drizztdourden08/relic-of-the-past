/* @layer tests @kind test */
// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { OutlinePanel } from '../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/OutlinePanel';
import { PlatformContext } from '@drizztdourden08/brock-react';
import type { Platform } from '@drizztdourden08/brock-core';
import type { HudLayout, HudNode } from '../../shared/types/hud';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const leaf = (id: string): HudNode => ({ id, kind: 'element', element: { type: 'spacer' } } as unknown as HudNode);

const DOC = {
  id: 'l',
  name: 'l',
  screen: {
    id: 'screen',
    kind: 'container',
    layout: 'grid',
    columns: ['auto', 'fill', 'auto'],
    rows: ['auto', 'fill', 'auto'],
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
    ],
  },
} as unknown as HudLayout;

const ROW = 22;
const PLATFORM = { info: { os: 'windows' } } as unknown as Platform;

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

const pointer = (type: string, x: number, y: number): MouseEvent =>
  new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y });

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

const driveFrames = (frames: number): number => {
  layOutRows();
  const target = rowFor('hearts').top + 14;
  act(() => { rowFor('magic-bar').element.dispatchEvent(pointer('pointerdown', 40, rowFor('magic-bar').top + 11)); });
  for (let i = 1; i <= frames; i += 1) {
    act(() => { window.dispatchEvent(pointer('pointermove', 40 + i * 4, target)); });
  }
  return target;
};

describe('one drag is one edit', () => {
  it('writes the document exactly once, on release and never before it', () => {
    const onDrop = vi.fn();
    mountOutline(onDrop);
    const target = driveFrames(12);

    expect(onDrop).toHaveBeenCalledTimes(0);
    expect(document.querySelector('.hud-ghost__kind')?.textContent).toBe('into row');
    expect(document.querySelector('.hud-ghost__l2')?.textContent).toBe('position 3 of 3');

    act(() => { window.dispatchEvent(pointer('pointerup', 92, target)); });
    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(onDrop).toHaveBeenCalledWith(['magic-bar'], { kind: 'flex', parentId: 'hearts', index: 2 });
  });

  it('is still a click when it never passed the slop threshold', () => {
    const onDrop = vi.fn();
    mountOutline(onDrop);
    layOutRows();
    const at = rowFor('magic-bar').top + 11;
    act(() => { rowFor('magic-bar').element.dispatchEvent(pointer('pointerdown', 40, at)); });
    act(() => { window.dispatchEvent(pointer('pointermove', 41, at)); });
    expect(document.querySelector('.hud-ghost')).toBeNull();
    act(() => { window.dispatchEvent(pointer('pointerup', 41, at)); });
    expect(onDrop).not.toHaveBeenCalled();
  });
});

describe('cancel is free, because nothing was written', () => {
  it('takes Escape mid-drag and leaves the document alone', () => {
    const onDrop = vi.fn();
    mountOutline(onDrop);
    const target = driveFrames(6);
    act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); });
    act(() => { window.dispatchEvent(pointer('pointerup', 64, target)); });
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('takes a pointercancel the same way, because a system gesture is not an edit', () => {
    const onDrop = vi.fn();
    mountOutline(onDrop);
    const target = driveFrames(6);
    act(() => { window.dispatchEvent(pointer('pointercancel', 64, target)); });
    act(() => { window.dispatchEvent(pointer('pointerup', 64, target)); });
    expect(onDrop).not.toHaveBeenCalled();
  });
});
