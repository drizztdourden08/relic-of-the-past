/* @layer renderer-components @kind component */
import { SearchInput, SegmentedControl, Tabs } from '@drizztdourden08/tessera/primitives';
import { FILTER_OPTIONS } from '../DialogueTab.constants';
import type { EntryFilter } from '../DialogueTab.type';
import type { SectionToolbarProps } from './studio-frame.type';

const SectionToolbar = (props: SectionToolbarProps) => {
  const { tabs, tab, query, filter, onTabChange, onQueryChange, onFilterChange } = props;

  return (
    <>
      <Tabs tabs={tabs} activeTab={tab} onTabChange={onTabChange} />
      {tab === 'dialogue' && (
        <>
          <SearchInput grow={false} size="sm" value={query} onChange={onQueryChange} placeholder="Search all text..." aria-label="Search all text" />
          <SegmentedControl<EntryFilter> options={FILTER_OPTIONS} value={filter} aria-label="Show lines" onChange={onFilterChange} />
        </>
      )}
    </>
  );
};

export { SectionToolbar };
