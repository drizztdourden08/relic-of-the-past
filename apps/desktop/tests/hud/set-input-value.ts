/* @layer tests @kind helper */
import { act } from 'react';

const setInputValue = (input: HTMLInputElement, text: string): void => {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  act(() => {
    setter?.call(input, text);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

export { setInputValue };
