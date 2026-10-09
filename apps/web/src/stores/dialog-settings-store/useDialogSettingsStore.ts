/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import type { DialogSettingsStore } from './dialog-settings-store.type';

const useDialogSettingsStore = create<DialogSettingsStore>()((set) => ({
  box: 'original',
  font: 'original',
  fontScale: 1,
  inkColor: '#ffffff',
  strokeColor: '#3850a8',
  strokeWidth: 0.5,
  highlightPrimary: '#e8a33d',
  highlightSecondary: '#7fb861',
  boxOpacity: 0.7,
  floatingGround: true,
  introTelepathyGround: false,
  groundFade: false,
  boxFit: 'message',
  groundColor: '#101018',
  border: 'original',
  borderThickness: 'medium',
  borderTint: '#f0f0f0',
  corner: 'square',
  cornerMark: 'none',
  cornerMarkAngle: 0,
  texture: 'none',
  textureColor: '#5fb3c4',
  textureOpacity: 0.25,
  textureAnimation: 'none',
  textureSpeed: 'normal',
  textureScale: 1,
  textureDensity: 60,
  textureScatter: 0,
  buttonPrompts: false,
  prompts: { speed: 1, holdSpeed: 2, holdToAccelerate: true, fillOnB: true },
  autoSkipDialog: false,
  setDialogSettings: (patch) => set(patch),
}));

export { useDialogSettingsStore };
