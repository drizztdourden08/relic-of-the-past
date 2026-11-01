/* @layer tests @kind helper */
import { act } from 'react';
import { createMountHarness } from '../mount-harness';

const installDomHarness = () => {
  const { mount } = createMountHarness({ platform: false, cssStub: true });

  const one = (selector: string): HTMLElement => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`nothing matched ${selector}`);
    return el as HTMLElement;
  };

  const click = (selector: string): void => { act(() => { one(selector).click(); }); };

  return { mount, one, click };
};

export { installDomHarness };
