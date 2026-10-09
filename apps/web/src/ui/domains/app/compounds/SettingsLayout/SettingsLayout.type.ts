/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';

type SettingLockCause = 'vanillaSafe' | 'randomizer';

interface SettingItem {
  key: string;
  label: string;
  description: string;
  keywords?: string;
  link?: string;
}

interface SubSection {
  id: string;
  title: string;
  items: SettingItem[];
}

interface Section {
  id: string;
  title: string;
  items?: SettingItem[];
  subsections?: SubSection[];
}

interface SettingsLayoutProps {
  sections: Section[];
  settings: GameSettings;
  defaults?: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  renderControl?: (key: string, settings: GameSettings, onChange: (patch: Partial<GameSettings>) => void) => ReactNode | null;
  isDisabled?: (key: string, settings: GameSettings) => boolean;
  onOpenVanillaSafeSettings?: () => void;
  emptyMessage?: string;
}

interface ItemGroup {
  id: string | null;
  title: string | null;
  items: SettingItem[];
}

interface ResolvedSection {
  id: string;
  title: string;
  groups: ItemGroup[];
}

type SettingsRecord = Record<string, unknown>;

interface SettingsPageContextValue {
  variant: 'page' | 'results';
  icon: ReactNode;
  title: string;
  backdrop?: ReactNode;
  query: string;
}

type SettingsSectionsProps = Omit<SettingsLayoutProps, 'sections'> & {
  sections: ResolvedSection[];
  lockCauseOf: (key: string) => SettingLockCause | null;
  isLockedKey: (key: string) => boolean;
};

interface SettingToggleProps {
  item: SettingItem;
  settings: GameSettings;
  disabled: boolean;
  onChange: (patch: Partial<GameSettings>) => void;
}

export type {
  ItemGroup,
  ResolvedSection,
  SettingItem,
  SettingToggleProps,
  SettingLockCause,
  SettingsLayoutProps,
  SettingsPageContextValue,
  SettingsRecord,
  SettingsSectionsProps,
  SubSection,
  Section,
};
