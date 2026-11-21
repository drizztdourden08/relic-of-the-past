/* @layer renderer-components @kind logic */
import type { ToolGroup } from '@drizztdourden08/tessera/primitives';
import { findShowGroups } from './find-show-groups';
import type { FileToolGroupsProps } from './file-tool-groups.type';

const fileToolGroups = (props: FileToolGroupsProps): ToolGroup[] => {
  const { t, tabs, filter, coveredCount, supersededOnly, onFilterChange, onSupersededOnlyChange } = props;
  return findShowGroups({
    t,
    tabs,
    find: {
      value: filter,
      onChange: onFilterChange,
      placeholder: t('msu-studio:files.find.placeholder'),
      ariaLabel: t('msu-studio:files.find.aria'),
    },
    show: {
      count: coveredCount,
      checked: supersededOnly,
      onChange: onSupersededOnlyChange,
      label: t('msu-studio:files.superseded-only', { count: coveredCount }),
    },
  });
};

export { fileToolGroups };
