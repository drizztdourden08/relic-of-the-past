/* @layer renderer-components @kind logic */
import type { ToolGroup } from '@drizztdourden08/tessera/primitives';
import { findShowGroups } from './find-show-groups';
import type { SoundToolGroupsProps } from './sound-tool-groups.type';

const soundToolGroups = (props: SoundToolGroupsProps): ToolGroup[] => {
  const { t, tabs, unreachableCount, filter, showUnreachable, onFilterChange, onShowUnreachableChange } = props;
  return findShowGroups({
    t,
    tabs,
    find: {
      value: filter,
      onChange: onFilterChange,
      placeholder: t('msu-studio:sound.filter.placeholder'),
      ariaLabel: t('msu-studio:sound.filter.aria'),
    },
    show: {
      count: unreachableCount,
      checked: showUnreachable,
      onChange: onShowUnreachableChange,
      label: t('msu-studio:sound.show-unreachable', { count: unreachableCount }),
    },
  });
};

export { soundToolGroups };
