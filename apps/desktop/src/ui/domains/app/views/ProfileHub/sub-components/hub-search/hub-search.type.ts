/* @layer renderer-components @kind types */
import type { GameSettings } from '@shared/types/settings';
import type { ProfileHubTab } from '../../ProfileHub.type';
import type { ProfileHubPaneProps } from '../ProfileHubBody.type';

interface TabMatches {
  withRows: { tab: ProfileHubTab; count: number }[];
  byName: ProfileHubTab[];
  total: number;
}

type HubSearchResultsProps = ProfileHubPaneProps & {
  query: string;
  tabs: readonly ProfileHubTab[];
  settings: GameSettings;
  onOpenTab: (tab: ProfileHubTab) => void;
};

interface HubSearchTabChipProps {
  tab: ProfileHubTab;
  onOpenTab: (tab: ProfileHubTab) => void;
}

interface HubSearchGroupProps {
  tab: ProfileHubTab;
  count: number;
  query: string;
  content: ProfileHubPaneProps;
  onOpenTab: (tab: ProfileHubTab) => void;
}

export type { HubSearchGroupProps, HubSearchResultsProps, HubSearchTabChipProps, TabMatches };
