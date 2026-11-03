/* @layer tests @kind helper */
import { createMountHarness } from '../mount-harness';
import { setInputValue } from '../set-input-value';

const installPlatformHarness = () => {
  const { mount, rerender } = createMountHarness();

  const field = (label: string): HTMLInputElement => {
    const el = document.querySelector(`[aria-label="${label}"]`);
    if (!el) throw new Error(`no field labelled "${label}"`);
    return el as HTMLInputElement;
  };

  const type = (label: string, text: string): void => { setInputValue(field(label), text); };

  return { mount, rerender, field, type };
};

export { installPlatformHarness };
