/* @layer renderer-components @kind logic */
import { createElement } from 'react';
import { Checkbox, SearchInput } from '@drizztdourden08/tessera/primitives';
import type { ToolGroup } from '@drizztdourden08/tessera/primitives';
import { sectionGroup } from './studio-frame/section-group';
import type { SoundToolGroupsProps } from './sound-tool-groups.type';

const soundToolGroups = (props: SoundToolGroupsProps): ToolGroup[] => {
  const { t, tabs, unreachableCount, filter, showUnreachable, onFilterChange, onShowUnreachableChange } = props;
  const groups: ToolGroup[] = [
    sectionGroup(t, tabs),
    {
      id: 'find',
      label: t('msu-studio:studio.toolbar.find'),
      content: createElement(SearchInput, {
        grow: false,
        value: filter,
        onChange: onFilterChange,
        placeholder: t('msu-studio:sound.filter.placeholder'),
        'aria-label': t('msu-studio:sound.filter.aria'),
      }),
    },
  ];
  if (unreachableCount === 0) return groups;

  return [
    ...groups,
    {
      id: 'show',
      label: t('msu-studio:studio.toolbar.show'),
      content: createElement(Checkbox, {
        checked: showUnreachable,
        onChange: onShowUnreachableChange,
        label: t('msu-studio:sound.show-unreachable', { count: unreachableCount }),
      }),
    },
  ];
};

export { soundToolGroups };
