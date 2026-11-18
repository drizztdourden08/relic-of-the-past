/* @layer renderer-components @kind logic */
import { createElement } from 'react';
import { Checkbox, SearchInput } from '@drizztdourden08/tessera/primitives';
import type { ToolGroup } from '@drizztdourden08/tessera/primitives';
import { sectionGroup } from './studio-frame/section-group';
import type { FileToolGroupsProps } from './file-tool-groups.type';

const fileToolGroups = (props: FileToolGroupsProps): ToolGroup[] => {
  const { t, tabs, filter, coveredCount, supersededOnly, onFilterChange, onSupersededOnlyChange } = props;
  const groups: ToolGroup[] = [
    sectionGroup(t, tabs),
    {
      id: 'find',
      label: t('msu-studio:studio.toolbar.find'),
      content: createElement(SearchInput, {
        grow: false,
        value: filter,
        onChange: onFilterChange,
        placeholder: t('msu-studio:files.find.placeholder'),
        'aria-label': t('msu-studio:files.find.aria'),
      }),
    },
  ];
  if (coveredCount === 0) return groups;

  return [
    ...groups,
    {
      id: 'show',
      label: t('msu-studio:studio.toolbar.show'),
      content: createElement(Checkbox, {
        checked: supersededOnly,
        label: t('msu-studio:files.superseded-only', { count: coveredCount }),
        onChange: onSupersededOnlyChange,
      }),
    },
  ];
};

export { fileToolGroups };
