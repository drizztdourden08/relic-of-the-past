/* @layer tests @kind helper */
import { afterEach } from 'vitest';
import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { PlatformContext } from '@drizztdourden08/brock-react';
import { WINDOWS_PLATFORM } from '../windows-platform';

const installPlatformHarness = () => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  let mounted: { root: Root; host: HTMLElement } | null = null;

  const mount = (node: ReactNode): void => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    act(() => { root.render(h(PlatformContext.Provider, { value: WINDOWS_PLATFORM }, node)); });
    mounted = { root, host };
  };

  const rerender = (node: ReactNode): void => {
    act(() => { mounted?.root.render(h(PlatformContext.Provider, { value: WINDOWS_PLATFORM }, node)); });
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

  const type = (label: string, text: string): void => {
    const input = field(label);
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    act(() => {
      setter?.call(input, text);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };

  return { mount, rerender, field, type };
};

export { installPlatformHarness };
