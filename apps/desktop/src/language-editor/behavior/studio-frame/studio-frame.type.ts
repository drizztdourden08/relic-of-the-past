/* @layer renderer-components @kind types */
import type { TabItem } from '@drizztdourden08/tessera/primitives';
import type { EntryFilter } from '../../sub-components/DialogueTab.type';

type StudioActionsParams = {
  hasSet: boolean;
  readOnly: boolean;
  dirty: boolean;
  saving: boolean;
  exporting: boolean;
  onSave: () => Promise<void>;
  onExport: () => Promise<void>;
};

type StudioToolbarParams = {
  tabs: TabItem[];
  tab: string;
  query: string;
  filter: EntryFilter;
  onTabChange: (tab: string) => void;
  onQueryChange: (query: string) => void;
  onFilterChange: (filter: EntryFilter) => void;
};

export type { StudioActionsParams, StudioToolbarParams };
