/* @layer tests @kind helper */
import { beforeEach } from 'vitest';
import { useHudEditorViewStore } from '../../../src/stores/hud-editor-view-store';
import { createMountHarness } from '../mount-harness';

const installPanelHarness = () => {
  const { mount } = createMountHarness({
    cssStub: true,
    afterUnmount: () => { document.querySelector('#portal-root')?.remove(); },
  });

  beforeEach(() => { useHudEditorViewStore.setState({ collapsedNodeIds: new Set() }); });

  return { mount };
};

export { installPanelHarness };
