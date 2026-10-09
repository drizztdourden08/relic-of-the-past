/* @layer tests @kind helper */
import { afterEach, beforeEach } from 'vitest';
import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useHudEditorViewStore } from '../../../apps/web/src/stores/hud-editor-view-store';
import { PlatformContext } from '../../../apps/web/src/platform/PlatformProvider';
import { PLATFORM } from './keyboard-move.constants';

const installPanelHarness = () => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  let mounted: { root: Root; host: HTMLElement } | null = null;

  const mount = (node: ReactNode): void => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    act(() => { root.render(h(PlatformContext.Provider, { value: PLATFORM }, node)); });
    mounted = { root, host };
  };

  beforeEach(() => { useHudEditorViewStore.setState({ collapsedNodeIds: new Set() }); });

  afterEach(() => {
    if (!mounted) return;
    const { root, host } = mounted;
    act(() => root.unmount());
    host.remove();
    mounted = null;
    document.querySelector('#portal-root')?.remove();
  });

  return { mount };
};

export { installPanelHarness };
