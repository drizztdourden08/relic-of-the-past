/* @layer renderer-components @kind logic */
import { createElement } from 'react';
import { Checkbox, SearchInput } from '@drizztdourden08/tessera/primitives';
import type { ToolGroup } from '@drizztdourden08/tessera/primitives';
import { sectionGroup } from './studio-frame/section-group';
import type { FindShowGroupsProps } from './find-show-groups.type';

const findShowGroups = ({ t, tabs, find, show }: FindShowGroupsProps): ToolGroup[] => {
  const groups: ToolGroup[] = [
    sectionGroup(t, tabs),
    {
      id: 'find',
      label: t('msu-studio:studio.toolbar.find'),
      content: createElement(SearchInput, {
        grow: false,
        value: find.value,
        onChange: find.onChange,
        placeholder: find.placeholder,
        'aria-label': find.ariaLabel,
      }),
    },
  ];
  if (show.count === 0) return groups;

  return [
    ...groups,
    {
      id: 'show',
      label: t('msu-studio:studio.toolbar.show'),
      content: createElement(Checkbox, { checked: show.checked, label: show.label, onChange: show.onChange }),
    },
  ];
};

export { findShowGroups };
