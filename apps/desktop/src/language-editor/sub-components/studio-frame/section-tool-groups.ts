/* @layer renderer-components @kind logic */
import { createElement } from 'react';
import { SearchInput, SegmentedControl, Tabs } from '@drizztdourden08/tessera/primitives';
import type { ToolGroup } from '@drizztdourden08/tessera/primitives';
import { FILTER_OPTIONS } from '../DialogueTab.constants';
import type { EntryFilter } from '../DialogueTab.type';
import type { SectionToolGroupsProps } from './studio-frame.type';

const sectionToolGroups = (props: SectionToolGroupsProps): ToolGroup[] => {
  const { tabs, tab, query, filter, onTabChange, onQueryChange, onFilterChange } = props;
  const section: ToolGroup = {
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
        grow: false, value: query, onChange: onQueryChange, placeholder: 'Search all text...', 'aria-label': 'Search all text',
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
};

export { sectionToolGroups };
