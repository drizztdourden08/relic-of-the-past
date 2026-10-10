/* @layer tests @kind helper */
import { afterEach } from 'vitest';
import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useHudEditorViewStore } from '../../../src/stores/hud-editor-view-store';
import { LayoutSection } from '@app/views/HudLayoutEditor/sub-components/sections/LayoutSection';
import { PlatformContext } from '@drizztdourden08/brock-react';
import type { HudContainer, HudGridContainer } from '@rotp/hud';
import { PLATFORM } from './grid-settings.constants';
import { screenRoot } from './screen-root';

const ignore = (): void => {};

const installLayoutSectionRig = () => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  const view = window as { CSS?: Pick<typeof CSS, 'supports'> };
  view.CSS ??= { supports: () => false };
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
    act(() => { useHudEditorViewStore.setState({ editorStep: 1 }); });
  });

  const mountGrid = (
    patch: (next: Partial<HudGridContainer>) => void = ignore,
    container: HudGridContainer = screenRoot(),
  ): void => {
    mount(h(LayoutSection, {
      node: container as unknown as HudContainer,
      onPatch: patch as (next: Partial<HudContainer>) => void,
      scope: {},
    }));
  };

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

  const states: Readonly<Record<string, () => void>> = {
    none: ignore,
    cell: () => down(cell(2, 2)),
    column: () => down(header('column 2')),
    row: () => down(header('row 2')),
  };

  return { mount, mountGrid, pick, cell, header, down, click, properties, bar, field, type, enter, states };
};

export { installLayoutSectionRig };
