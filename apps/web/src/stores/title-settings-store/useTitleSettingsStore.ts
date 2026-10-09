/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import type { TitleSettingsStore } from './title-settings-store.type';

const useTitleSettingsStore = create<TitleSettingsStore>()((set) => ({
  screen: 'reimagined',
  motion: 'drifting',
  followsProgress: true,
  sword: 'progress',
  dimFlashes: false,
  setTitleSettings: (patch) => set(patch),
}));

export { useTitleSettingsStore };
