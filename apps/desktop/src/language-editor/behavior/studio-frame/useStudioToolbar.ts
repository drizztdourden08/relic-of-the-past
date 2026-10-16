/* @layer renderer-components @kind hook */
import { createElement, useMemo } from 'react';
import { SearchInput, SegmentedControl, Tabs } from '@drizztdourden08/tessera/primitives';
import type { StudioToolGroup } from '@app/compounds/StudioFrame';
import { FILTER_OPTIONS } from '../../sub-components/DialogueTab.constants';
import type { EntryFilter } from '../../sub-components/DialogueTab.type';
import type { StudioToolbarParams } from './studio-frame.type';

const useStudioToolbar = (params: StudioToolbarParams): StudioToolGroup[] => {
  const { tabs, tab, query, filter, onTabChange, onQueryChange, onFilterChange } = params;

  return useMemo<StudioToolGroup[]>(() => {
    const section: StudioToolGroup = {
      id: 'section',
      label: 'Section',
      content: createElement(Tabs, { tabs, activeTab: tab, onTabChange }),
    };
    if (tab !== 'dialogue') return [section];
    return [
      section,
      {
        id: 'find',
        label: 'Find',
        content: createElement(SearchInput, {
          value: query, onChange: onQueryChange, placeholder: 'Search all text...', 'aria-label': 'Search all text',
        }),
      },
      {
        id: 'show',
        label: 'Show',
        content: createElement(SegmentedControl<EntryFilter>, {
          options: FILTER_OPTIONS, value: filter, 'aria-label': 'Show lines', onChange: onFilterChange,
        }),
      },
    ];
  }, [tabs, tab, query, filter, onTabChange, onQueryChange, onFilterChange]);
};

export { useStudioToolbar };
