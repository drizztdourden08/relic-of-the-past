/* @layer renderer-components @kind types */
import type { LanguageSet } from '@rotp/languages';
import type { EntryFactsProps } from '@rotp/design/packs';
import type { TabItem } from '@drizztdourden08/tessera/primitives';
import type { SaveStatusBadgeProps } from '../SaveStatusBadge.type';
import type { EntryFilter } from '../DialogueTab.type';

type StudioStatusProps = SaveStatusBadgeProps & {
  exportStatus: string | null;
};

type SetPropertiesProps = {
  set: LanguageSet;
  warnings: number;
};

type EntryPropertiesProps = {
  selection: EntryFactsProps;
  readOnly: boolean;
  onNote: (id: number, note: string) => void;
};

type LanguagePropertiesProps = SetPropertiesProps & {
  selection: EntryFactsProps | null;
  readOnly: boolean;
  onNote: (id: number, note: string) => void;
};

type SectionToolbarProps = {
  tabs: TabItem[];
  tab: string;
  query: string;
  filter: EntryFilter;
  onTabChange: (tab: string) => void;
  onQueryChange: (query: string) => void;
  onFilterChange: (filter: EntryFilter) => void;
};

export type {
  EntryPropertiesProps, LanguagePropertiesProps, SectionToolbarProps, SetPropertiesProps, StudioStatusProps,
};
