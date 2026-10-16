/* @layer renderer-components @kind component */
import { Checkbox, SearchInput } from '@drizztdourden08/tessera/primitives';
import type { ToolGroup } from '@drizztdourden08/tessera/primitives';
import { SOUND_FILTER_PLACEHOLDER } from './msu.constants';
import { sectionGroup } from './studio-frame/section-group';
import type { SoundToolGroupsProps } from './sound-tool-groups.type';

const soundToolGroups = (props: SoundToolGroupsProps): ToolGroup[] => {
  const { tabs, unreachableCount, filter, showUnreachable, onFilterChange, onShowUnreachableChange } = props;
  const groups: ToolGroup[] = [
    sectionGroup(tabs),
    {
      id: 'find',
      label: 'Find',
      content: <SearchInput grow={false} value={filter} onChange={onFilterChange} placeholder={SOUND_FILTER_PLACEHOLDER} aria-label="Find a sound" />,
    },
  ];
  if (unreachableCount === 0) return groups;

  return [
    ...groups,
    {
      id: 'show',
      label: 'Show',
      content: <Checkbox checked={showUnreachable} onChange={onShowUnreachableChange} label={`Show ${unreachableCount} unreachable ids`} />,
    },
  ];
};

export { soundToolGroups };
