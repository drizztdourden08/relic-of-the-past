/* @layer renderer-stores @kind logic */
/** The title screen's look, mirrored from the profile settings for the overlay to read live. */
import { create } from 'zustand';
import type { TitleSword } from '@shared/game/title/title-swords';

interface TitleSettings {
  screen: 'original' | 'reimagined';
  motion: 'still' | 'drifting';
  followsProgress: boolean;
  sword: TitleSword;
  /** The game's own dim-flashes switch, so the clang flash is as soft as the player asked for. */
  dimFlashes: boolean;
}

interface TitleSettingsStore extends TitleSettings {
  setTitleSettings: (patch: Partial<TitleSettings>) => void;
}

const useTitleSettingsStore = create<TitleSettingsStore>()((set) => ({
  screen: 'reimagined',
  motion: 'drifting',
  followsProgress: true,
  sword: 'progress',
  dimFlashes: false,
  setTitleSettings: (patch) => set(patch),
}));

export { useTitleSettingsStore };
export type { TitleSettings };
