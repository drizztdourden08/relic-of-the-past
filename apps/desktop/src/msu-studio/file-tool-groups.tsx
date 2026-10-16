/* @layer renderer-components @kind component */
import { Checkbox, SearchInput } from '@drizztdourden08/tessera/primitives';
import type { ToolGroup } from '@drizztdourden08/tessera/primitives';
import { sectionGroup } from './studio-frame/section-group';
import type { FileToolGroupsProps } from './file-tool-groups.type';

const fileToolGroups = (props: FileToolGroupsProps): ToolGroup[] => {
  const { tabs, filter, coveredCount, supersededOnly, onFilterChange, onSupersededOnlyChange } = props;
  const groups: ToolGroup[] = [
    sectionGroup(tabs),
    {
      id: 'find',
      label: 'Find',
      content: <SearchInput grow={false} value={filter} onChange={onFilterChange} placeholder="intro, pcm..." aria-label="Find a file" />,
    },
  ];
  if (coveredCount === 0) return groups;

  return [
    ...groups,
    {
      id: 'show',
      label: 'Show',
      content: <Checkbox checked={supersededOnly} label={`Superseded originals only (${coveredCount})`} onChange={onSupersededOnlyChange} />,
    },
  ];
};

export { fileToolGroups };
