/* @layer tests @kind helper */
import { afterEach } from 'vitest';
import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { GridEditor } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/GridEditor';
import { PlatformContext } from '@drizztdourden08/brock-react';
import { PLATFORM } from './grid-editor.constants';
import { screenRoot } from './screen-root';

const ignore = (): void => {};

const installGridRig = () => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  class NoopResizeObserver { observe = ignore; unobserve = ignore; disconnect = ignore; }
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = NoopResizeObserver;
  let mounted: { root: Root; host: HTMLElement } | null = null;

  const mount = (node: ReactNode): void => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    act(() => { root.render(h(PlatformContext.Provider, { value: PLATFORM }, node)); });
    mounted = { root, host };
  };

  afterEach(() => {
    if (!mounted) return;
    act(() => mounted?.root.unmount());
    mounted.host.remove();
    mounted = null;
    document.querySelector('#portal-root')?.remove();
  });

  const cell = (column: number, row: number): HTMLElement => {
    const found = document.querySelector<HTMLElement>(`.hud-lattice__cell[data-column="${column}"][data-row="${row}"]`);
    if (!found) throw new Error(`no cell ${column},${row}`);
    return found;
  };

  const header = (label: string): HTMLElement => {
    const found = Array.from(document.querySelectorAll<HTMLElement>('.hud-lattice__head'))
      .find((el) => (el.getAttribute('aria-label') ?? '').startsWith(label));
    if (!found) throw new Error(`no header ${label}`);
    return found;
  };

  const down = (el: Element, init: MouseEventInit = {}): void => {
    act(() => { el.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true, ...init })); });
  };

  const enter = (el: Element): void => {
    act(() => { el.dispatchEvent(new MouseEvent('pointerover', { bubbles: true, cancelable: true })); });
  };

  const up = (el: Element): void => {
    act(() => { el.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, cancelable: true })); });
  };

  const press = (key: string, init: KeyboardEventInit = {}): void => {
    const body = document.querySelector('.hud-lattice__body');
    act(() => { body?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })); });
  };

  const toolbarKeys = (): string[] =>
    Array.from(document.querySelectorAll('.hud-grid__bar [data-action]'))
      .map((el) => (el as HTMLElement).dataset.action ?? '?');

  const legendCaps = (): string[] =>
    Array.from(document.querySelectorAll('.hud-grid__key')).map((el) => el.textContent ?? '');

  const status = (): string => document.querySelector('.hud-grid__status')?.textContent ?? '';

  const mountGrid = (onPatchContainer: (patch: unknown) => void = ignore): void => {
    mount(h(GridEditor, {
      container: screenRoot(), scope: {}, onPatchContainer, onSetEngine: ignore,
    }));
  };

  return { mount, cell, header, down, enter, up, press, toolbarKeys, legendCaps, status, mountGrid };
};

export { installGridRig };
