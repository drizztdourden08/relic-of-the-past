/* @layer tests @kind helper */
import { afterEach } from 'vitest';
import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { PlatformContext } from '@drizztdourden08/brock-react';
import { WINDOWS_PLATFORM } from './windows-platform';

interface MountHarnessOptions {
  platform?: boolean;
  cssStub?: boolean;
  noopResizeObserver?: boolean;
  afterUnmount?: () => void;
}

const ignore = (): void => {};

class NoopResizeObserver {
  observe = ignore;
  unobserve = ignore;
  disconnect = ignore;
}

const createMountHarness = (options: MountHarnessOptions = {}) => {
  const { platform = true, cssStub = false, noopResizeObserver = false, afterUnmount } = options;
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  if (cssStub) {
    const view = window as { CSS?: Pick<typeof CSS, 'supports'> };
    view.CSS ??= { supports: () => false };
  }
  if (noopResizeObserver) (globalThis as { ResizeObserver?: unknown }).ResizeObserver = NoopResizeObserver;
  let mounted: { root: Root; host: HTMLElement } | null = null;

  const wrap = (node: ReactNode): ReactNode =>
    (platform ? h(PlatformContext.Provider, { value: WINDOWS_PLATFORM }, node) : node);

  const mount = (node: ReactNode): void => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    act(() => { root.render(wrap(node)); });
    mounted = { root, host };
  };

  const rerender = (node: ReactNode): void => {
    act(() => { mounted?.root.render(wrap(node)); });
  };

  const unmount = (): void => {
    if (!mounted) return;
    const { root, host } = mounted;
    act(() => root.unmount());
    host.remove();
    mounted = null;
  };

  afterEach(() => {
    unmount();
    afterUnmount?.();
  });

  return { mount, rerender, unmount };
};

export { createMountHarness };
