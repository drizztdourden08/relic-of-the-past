/* @layer renderer-components @kind types */
﻿import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';

interface SettingItem {
  key: string;
  label: string;
  description: string;
  keywords?: string;
  /** Optional external URL to open when an info link is clicked */
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
  subsections: SubSection[];
}

interface SettingsLayoutProps {
  sections: Section[];
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  renderControl?: (key: string, settings: GameSettings, onChange: (patch: Partial<GameSettings>) => void) => ReactNode | null;
  isDisabled?: (key: string, settings: GameSettings) => boolean;
}

export type {
  SettingItem,
  SubSection,
  Section,
  SettingsLayoutProps,
};
