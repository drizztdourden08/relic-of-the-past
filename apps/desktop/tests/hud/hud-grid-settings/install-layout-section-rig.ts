/* @layer tests @kind helper */
import { act, createElement as h } from 'react';
import { useHudEditorViewStore } from '../../../src/stores/hud-editor-view-store';
import { LayoutSection } from '@app/views/HudLayoutEditor/sub-components/LayoutSection';
import type { HudContainer, HudGridContainer } from '@rotp/hud';
import { createMountHarness } from '../mount-harness';
import { screenRoot } from './screen-root';
import { sectionDom } from './section-dom';

const ignore = (): void => {};
const { pick, cell, header, down, click, properties, bar, field, type, enter } = sectionDom;

const installLayoutSectionRig = () => {
  const { mount } = createMountHarness({
    cssStub: true,
    noopResizeObserver: true,
    afterUnmount: () => {
      document.querySelector('#portal-root')?.remove();
      act(() => { useHudEditorViewStore.setState({ editorStep: 1 }); });
    },
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
