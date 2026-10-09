/* @layer renderer-stores @kind types */
import type { TitleSword } from '@shared/game/title/title-swords';

interface TitleSettings {
  screen: 'original' | 'reimagined';
  motion: 'still' | 'drifting';
  followsProgress: boolean;
  sword: TitleSword;
  dimFlashes: boolean;
}

interface TitleSettingsStore extends TitleSettings {
  setTitleSettings: (patch: Partial<TitleSettings>) => void;
}

export type { TitleSettings, TitleSettingsStore };
