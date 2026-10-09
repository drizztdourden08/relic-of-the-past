/* @layer tests @kind helper */
import { afterEach } from 'vitest';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';

const installDomHarness = () => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  const view = window as { CSS?: Pick<typeof CSS, 'supports'> };
  view.CSS ??= { supports: () => false };
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
  });

  const one = (selector: string): HTMLElement => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`nothing matched ${selector}`);
    return el as HTMLElement;
  };

  const click = (selector: string): void => { act(() => { one(selector).click(); }); };

  return { mount, one, click };
};

export { installDomHarness };
