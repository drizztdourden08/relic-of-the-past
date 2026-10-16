/* @layer renderer-components @kind hook */
import { createElement, useMemo } from 'react';
import { Tabs } from '@drizztdourden08/tessera/primitives';
import type { ToolGroup } from '@drizztdourden08/tessera/primitives';
import { STUDIO_TABS } from '../../sound-labels';
import type { StudioTab } from '../../sound-labels';
import type { StudioToolbarParams } from './studio-frame.type';

const useStudioToolbar = (params: StudioToolbarParams): ToolGroup[] => {
  const { tab, onTabChange } = params;

  return useMemo<ToolGroup[]>(() => [{
    id: 'section',
    label: 'Section',
    content: createElement(Tabs, {
      tabs: STUDIO_TABS,
      activeTab: tab,
      onTabChange: (id: string) => { onTabChange(id as StudioTab); },
    }),
  }], [tab, onTabChange]);
};

export { useStudioToolbar };
