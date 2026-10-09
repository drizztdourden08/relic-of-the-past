/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { CommandPaletteItem } from '@drizztdourden08/tessera/composites';
import type { GameSettings } from '@shared/types/settings';
import type { WindowControlsPort } from '@shared/platform';
import type { TitleBarProps } from '../TitleBar/TitleBar.type';
import type { ProfileHubTab } from '../ProfileHub/ProfileHub.type';
import type { PageId } from '@app/App/types';

type SearchKind = 'screen' | 'action' | 'setting' | 'tab';

interface SearchTarget {
  page: PageId;
  tab?: ProfileHubTab;
  anchor?: string;
}

interface SearchEntry {
  id: string;
  kind: SearchKind;
  label: string;
  icon?: ReactNode;
  breadcrumb: string[];
  description?: string;
  keywords?: string;
  settingKey?: keyof GameSettings;
  toggleValue?: boolean;
  disabled?: boolean;
  checked?: boolean;
  target?: SearchTarget;
  run?: () => void;
}

interface SearchContext {
  navProps: TitleBarProps;
  win: WindowControlsPort;
  settings: GameSettings | null;
  isMobile: boolean;
  isOnline?: boolean;
  closePalette: () => void;
}

interface SearchSource {
  id: string;
  build: (ctx: SearchContext) => SearchEntry[];
}

interface RunTargetDeps {
  setActivePage: (page: PageId) => void;
  setProfileHubTab: (tab: ProfileHubTab) => void;
}

interface SearchPaletteProps {
  navProps: TitleBarProps;
  navDeps: RunTargetDeps;
}

interface SearchPaletteItem extends CommandPaletteItem {
  entry: SearchEntry;
}

interface FieldWeights {
  exact: number;
  prefix: number;
  wordStart: number;
  substring: number;
}

interface BooleanSettingInfo {
  settingKey?: keyof GameSettings;
  toggleValue?: boolean;
}

export type {
  BooleanSettingInfo,
  FieldWeights,
  RunTargetDeps,
  SearchContext,
  SearchEntry,
  SearchKind,
  SearchPaletteItem,
  SearchPaletteProps,
  SearchSource,
  SearchTarget,
};
