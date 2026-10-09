/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import type { HudSettingsStore } from './hud-settings-store.type';

const useHudSettingsStore = create<HudSettingsStore>()((set) => ({
  mode: 'original',
  style: 'vanilla',
  ratio: 'match',
  customW: 0,
  customH: 0,
  enhancedParts: ['main', 'pause'],
  heartMode: 'original',
  magicMode: 'original',
  countLayout: 'centered',
  countdownStyle: 'pixel',
  showMaxInYellow: false,
  setHudSettings: (patch) => set(patch),
}));

export { useHudSettingsStore };
