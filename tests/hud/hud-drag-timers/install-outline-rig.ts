/* @layer tests @kind helper */
import { afterEach, beforeEach, vi } from 'vitest';
import { act, createElement as h } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { OutlinePanel } from '../../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/OutlinePanel';
import { useHudEditorViewStore } from '../../../apps/web/src/stores/hud-editor-view-store';
import { PlatformContext } from '../../../apps/web/src/platform/PlatformProvider';
import { DOC, PLATFORM, ROW, VIEW } from './drag-timers.constants';

const installOutlineRig = () => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  let pending = new Map<number, FrameRequestCallback>();
  let nextFrame = 1;
  let scrolled = 0;
  let mounted: { root: Root; host: HTMLElement } | null = null;
  const realRaf = globalThis.requestAnimationFrame;
  const realCaf = globalThis.cancelAnimationFrame;

  const runFrames = (times = 1): void => {
    for (let i = 0; i < times; i += 1) {
      const due = [...pending.values()];
      pending = new Map();
      act(() => { due.forEach((cb) => cb(0)); });
    }
  };

  const unmount = (): void => {
    if (!mounted) return;
    const { root, host } = mounted;
    act(() => root.unmount());
    host.remove();
    mounted = null;
  };

  beforeEach(() => {
    pending = new Map();
    nextFrame = 1;
    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      const id = nextFrame; nextFrame += 1; pending.set(id, cb); return id;
    }) as typeof globalThis.requestAnimationFrame;
    globalThis.cancelAnimationFrame = ((id: number) => { pending.delete(id); }) as typeof globalThis.cancelAnimationFrame;
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    useHudEditorViewStore.setState({ collapsedNodeIds: new Set() });
  });

  afterEach(() => {
    unmount();
    document.querySelector('#portal-root')?.remove();
    vi.useRealTimers();
    globalThis.requestAnimationFrame = realRaf;
    globalThis.cancelAnimationFrame = realCaf;
  });

  const rowsInOrder = (): HTMLElement[] =>
    Array.from(document.querySelectorAll('[data-outline-row]')) as HTMLElement[];

  const rect = (box: typeof VIEW): DOMRect => ({
    x: box.left, y: box.top, width: box.right - box.left, height: box.bottom - box.top,
    top: box.top, left: box.left, right: box.right, bottom: box.bottom, toJSON: () => ({}),
  }) as DOMRect;

  const layOut = (canScroll = true): HTMLElement => {
    rowsInOrder().forEach((row, index) => {
      row.getBoundingClientRect = () => rect({ top: index * ROW, bottom: (index + 1) * ROW, left: 0, right: 200 });
    });
    document.elementFromPoint = (_x: number, y: number) => rowsInOrder()[Math.floor(y / ROW)] ?? null;
    const rows = document.querySelector('.hud-outline__rows') as HTMLElement;
    scrolled = 0;
    rows.getBoundingClientRect = () => rect(VIEW);
    Object.defineProperty(rows, 'scrollHeight', { get: () => (canScroll ? 1000 : 200), configurable: true });
    Object.defineProperty(rows, 'clientHeight', { get: () => 200, configurable: true });
    Object.defineProperty(rows, 'scrollTop', {
      get: () => scrolled, set: (v: number) => { scrolled = v; }, configurable: true,
    });
    return rows;
  };

  const pointer = (type: string, y: number): MouseEvent =>
    new MouseEvent(type, { bubbles: true, cancelable: true, clientX: 40, clientY: y });

  const rowFor = (id: string): HTMLElement => {
    const found = rowsInOrder().find((row) => row.dataset.outlineRow === id);
    if (!found) throw new Error(`no row for ${id}`);
    return found;
  };

  const mountOutline = (onDrop: (ids: readonly string[], intent: unknown) => void = () => {}): void => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    act(() => {
      root.render(h(PlatformContext.Provider, { value: PLATFORM }, h(OutlinePanel, {
        doc: DOC, selectedId: null, slotNumbers: [], onSelect: () => {}, onRemove: () => {}, onDrop,
      })));
    });
    mounted = { root, host };
  };

  const dragTo = (y: number): void => {
    act(() => { rowFor('a').dispatchEvent(pointer('pointerdown', 11)); });
    act(() => { window.dispatchEvent(pointer('pointermove', 40)); });
    act(() => { window.dispatchEvent(pointer('pointermove', y)); });
  };

  return {
    runFrames, unmount, rowsInOrder, layOut, pointer, rowFor, mountOutline, dragTo,
    pendingFrames: (): number => pending.size,
    scrolled: (): number => scrolled,
  };
};

export { installOutlineRig };
