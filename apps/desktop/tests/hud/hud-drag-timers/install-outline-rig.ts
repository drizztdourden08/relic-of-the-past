/* @layer tests @kind helper */
import { afterEach, beforeEach, vi } from 'vitest';
import { act, createElement as h } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { OutlinePanel } from '@app/views/HudLayoutEditor/sub-components/OutlinePanel';
import { useHudEditorViewStore } from '../../../src/stores/hud-editor-view-store';
import { PlatformContext } from '@drizztdourden08/brock-react';
import { DOC, ROW, VIEW } from './drag-timers.constants';
import { createFrameQueue } from './frame-queue';
import { outlineDom } from './outline-dom';
import { WINDOWS_PLATFORM } from '../windows-platform';

const { rowsInOrder, rect, pointer, rowFor } = outlineDom;

const installOutlineRig = () => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  const frames = createFrameQueue();
  let scrolled = 0;
  let mounted: { root: Root; host: HTMLElement } | null = null;

  const unmount = (): void => {
    if (!mounted) return;
    const { root, host } = mounted;
    act(() => root.unmount());
    host.remove();
    mounted = null;
  };

  beforeEach(() => {
    frames.install();
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    useHudEditorViewStore.setState({ collapsedNodeIds: new Set() });
  });

  afterEach(() => {
    unmount();
    document.querySelector('#portal-root')?.remove();
    vi.useRealTimers();
    frames.restore();
  });

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

  const mountOutline = (onDrop: (ids: readonly string[], intent: unknown) => void = () => {}): void => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    act(() => {
      root.render(h(PlatformContext.Provider, { value: WINDOWS_PLATFORM }, h(OutlinePanel, {
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
    runFrames: frames.run, unmount, rowsInOrder, layOut, pointer, rowFor, mountOutline, dragTo,
    pendingFrames: frames.size,
    scrolled: (): number => scrolled,
  };
};

export { installOutlineRig };
