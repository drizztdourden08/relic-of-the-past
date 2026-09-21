/* @layer renderer-components @kind types */
﻿import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';

/** Why a settings control is locked, which decides the overlay copy and action. */
type SettingLockCause = 'vanillaSafe' | 'randomizer';

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

/**
 * A section holds either a flat list of items or named subsections, never both. A subject
 * with nothing to divide (one screen of related toggles) takes `items` and gets no second
 * heading, so the nav shows the section alone and the panel stops repeating itself.
 */
interface Section {
  id: string;
  title: string;
  items?: SettingItem[];
  subsections?: SubSection[];
}

interface SettingsLayoutProps {
  sections: Section[];
  settings: GameSettings;
  /** The app's factory settings, which the per-section reset writes back. Omit it and the
   *  sections render as bare headings with no reset action. */
  defaults?: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  renderControl?: (key: string, settings: GameSettings, onChange: (patch: Partial<GameSettings>) => void) => ReactNode | null;
  isDisabled?: (key: string, settings: GameSettings) => boolean;
  /** Invoked when a Vanilla-Safe-locked control's overlay action is activated. Required to
   *  make the lock interactive; omitting it just leaves the action inert. */
  onOpenVanillaSafeSettings?: () => void;
}

export type {
  SettingItem,
  SettingLockCause,
  SubSection,
  Section,
  SettingsLayoutProps,
};
