/* @layer renderer-components @kind logic */
import { createElement } from 'react';
import { SearchInput, SegmentedControl, Tabs } from '@drizztdourden08/tessera/primitives';
import type { ToolGroup } from '@drizztdourden08/tessera/primitives';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { filterOptionsOf } from '../DialogueTab.constants';
import type { EntryFilter } from '../DialogueTab.type';
import type { SectionToolGroupsProps } from './studio-frame.type';

const sectionToolGroups = (t: I18n['t'], props: SectionToolGroupsProps): ToolGroup[] => {
  const { tabs, tab, query, filter, onTabChange, onQueryChange, onFilterChange } = props;
  const section: ToolGroup = {
    id: 'section',
    label: t('language-editor:toolbar.section'),
    content: createElement(Tabs, { tabs, activeTab: tab, onTabChange }),
  };
  if (tab !== 'dialogue') return [section];

  return [
    section,
    {
      id: 'find',
      label: t('language-editor:toolbar.find'),
      content: createElement(SearchInput, {
        grow: false,
        value: query,
        onChange: onQueryChange,
        placeholder: t('language-editor:toolbar.find-placeholder'),
        'aria-label': t('language-editor:toolbar.find-label'),
      }),
    },
    {
      id: 'show',
      label: t('language-editor:toolbar.show'),
      content: createElement(SegmentedControl<EntryFilter>, {
        options: filterOptionsOf(t), value: filter, 'aria-label': t('language-editor:toolbar.show-label'), onChange: onFilterChange,
      }),
    },
  ];
};

export { sectionToolGroups };
