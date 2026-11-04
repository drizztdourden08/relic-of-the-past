/* @layer tests @kind test */
// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { OutlinePanel } from '@app/views/HudLayoutEditor/sub-components/OutlinePanel';
import { PlatformContext } from '@drizztdourden08/brock-react';
import { DOC } from './ghost-doc.constants';
import { required } from '@rotp/asset-extraction/testing';
import { WINDOWS_PLATFORM } from '../windows-platform';

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

const ROW = 22;

const rowsInOrder = (): HTMLElement[] =>
  Array.from(document.querySelectorAll('[data-outline-row]'));

const layOutRows = (): void => {
  rowsInOrder().forEach((row, index) => {
    row.getBoundingClientRect = () => ({
      x: 0, y: index * ROW, width: 200, height: ROW, top: index * ROW, left: 0,
      right: 200, bottom: (index + 1) * ROW, toJSON: () => ({}),
    });
  });
  document.elementFromPoint = (_x: number, y: number) => rowsInOrder()[Math.floor(y / ROW)] ?? null;
};

const rowFor = (id: string): { element: HTMLElement; top: number } => {
  const rows = rowsInOrder();
  const index = rows.findIndex((row) => row.dataset.outlineRow === id);
  if (index < 0) throw new Error(`no row for ${id}`);
  return { element: required(rows[index], `the row for ${id}`), top: index * ROW };
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

describe('the outline, with a ghost on it', { tags: ['standard'] }, () => {
  const mountOutline = (onDrop: (ids: readonly string[], intent: unknown) => void): void => {
    mount(h(PlatformContext.Provider, { value: WINDOWS_PLATFORM }, h(OutlinePanel, {
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
    act(() => { window.dispatchEvent(pointer('pointerup', rowFor('hearts').top + 14)); });
    expect(onDrop).toHaveBeenCalledWith(['magic-bar'], { kind: 'flex', parentId: 'hearts', index: 2 });
  });
});
