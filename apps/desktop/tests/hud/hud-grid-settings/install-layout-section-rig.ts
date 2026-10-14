/* @layer tests @kind helper */
import { afterEach } from 'vitest';
import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useHudEditorViewStore } from '../../../src/stores/hud-editor-view-store';
import { LayoutSection } from '@app/views/HudLayoutEditor/sub-components/LayoutSection';
import { PlatformContext } from '@drizztdourden08/brock-react';
import type { HudContainer, HudGridContainer } from '@rotp/hud';
import { screenRoot } from './screen-root';
import { sectionDom } from './section-dom';
import { WINDOWS_PLATFORM } from '../windows-platform';

const ignore = (): void => {};
const { pick, cell, header, down, click, properties, bar, field, type, enter } = sectionDom;

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
    act(() => { root.render(h(PlatformContext.Provider, { value: WINDOWS_PLATFORM }, node)); });
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
      node: container,
      onPatch: patch as (next: Partial<HudContainer>) => void,
      scope: {},
    }));
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
