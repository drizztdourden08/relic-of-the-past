/* @layer tests @kind helper */
import { act, createElement as h } from 'react';
import { GridEditor } from '@app/views/HudLayoutEditor/sub-components/GridEditor';
import type { HudGridContainer } from '@rotp/hud';
import { createMountHarness } from '../mount-harness';
import { sectionDom } from '../hud-grid-settings/section-dom';
import { screenRoot } from './screen-root';

const ignore = (): void => {};
const { cell, header, down } = sectionDom;

const installGridRig = () => {
  const { mount } = createMountHarness({
    noopResizeObserver: true,
    afterUnmount: () => { document.querySelector('#portal-root')?.remove(); },
  });

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

  const status = (): string => document.querySelector('.hud-grid__status')?.textContent ?? '';

  const mountGrid = (onPatchContainer: (patch: Partial<HudGridContainer>) => void = ignore): void => {
    mount(h(GridEditor, { container: screenRoot(), onPatchContainer }));
  };

  return { mount, cell, header, down, enter, up, press, toolbarKeys, status, mountGrid };
};

export { installGridRig };
