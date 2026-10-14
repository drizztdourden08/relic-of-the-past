/* @layer tests @kind helper */
import { act } from 'react';

const pick = <T extends HTMLElement>(selector: string): T => {
  const found = document.querySelector<T>(selector);
  if (!found) throw new Error(`no ${selector}`);
  return found;
};

const cell = (column: number, row: number): HTMLElement =>
  pick(`.hud-lattice__cell[data-column="${column}"][data-row="${row}"]`);

const header = (label: string): HTMLElement => {
  const found = Array.from(document.querySelectorAll<HTMLElement>('.hud-lattice__head'))
    .find((el) => (el.getAttribute('aria-label') ?? '').startsWith(label));
  if (!found) throw new Error(`no header ${label}`);
  return found;
};

const down = (el: Element, init: MouseEventInit = {}): void => {
  act(() => { el.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true, ...init })); });
};

const click = (el: Element | null | undefined): void => {
  act(() => { (el as HTMLElement | null)?.click(); });
};

const properties = (): string =>
  Array.from(document.querySelectorAll('.hud-subsec'))
    .filter((el) => !el.querySelector('.hud-grid'))
    .map((el) => el.innerHTML).join('|');

const bar = (): HTMLElement => pick('.hud-grid__bar');

const field = (label: string): HTMLInputElement => pick(`[aria-label="${label}"]`);

const type = (label: string, text: string): void => {
  const input = field(label);
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  act(() => {
    setter?.call(input, text);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

const enter = (label: string): void => {
  act(() => {
    field(label).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
  });
};

const sectionDom = { pick, cell, header, down, click, properties, bar, field, type, enter };

export { sectionDom };
