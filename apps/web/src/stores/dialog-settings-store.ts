/* @layer renderer-stores @kind logic */
/** The message-box look, mirrored from the profile settings for the overlay to read live. */
import { create } from 'zustand';
import type { PromptControls } from '@shared/game/dialog/dialog-prompts';
import type {
  DialogBorder, DialogBorderThickness, DialogCorner, DialogCornerMark,
  DialogTexture, DialogTextureAnimation, DialogTextureSpeed,
} from '@shared/game/dialog/box-style';

interface DialogBoxSettings {
  box: 'original' | 'enhanced';
  font: 'original' | 'modern';
  fontScale: number;
  inkColor: string;
  strokeColor: string;
  strokeWidth: number;
  boxOpacity: number;
  floatingGround: boolean;
  groundFade: boolean;
  boxFit: 'full' | 'message' | 'fit';
  groundColor: string;
  border: DialogBorder;
  borderThickness: DialogBorderThickness;
  borderTint: string;
  corner: DialogCorner;
  cornerMark: DialogCornerMark;
  cornerMarkAngle: number;
  texture: DialogTexture;
  textureColor: string;
  textureOpacity: number;
  textureAnimation: DialogTextureAnimation;
  textureSpeed: DialogTextureSpeed;
  textureScale: number;
  textureDensity: number;
  textureScatter: number;
  /** Show which buttons act on the message, under the box. */
  buttonPrompts: boolean;
  /** The pacing controls that are on, which the prompts describe. */
  prompts: PromptControls;
  /** Skipped messages never show, so the overlay only draws a box that waits on a choice. */
  autoSkipDialog: boolean;
}

interface DialogSettingsStore extends DialogBoxSettings {
  setDialogSettings: (patch: Partial<DialogBoxSettings>) => void;
}

const useDialogSettingsStore = create<DialogSettingsStore>()((set) => ({
  box: 'original',
  font: 'original',
  fontScale: 1,
  inkColor: '#ffffff',
  strokeColor: '#3850a8',
  strokeWidth: 0.5,
  boxOpacity: 0.7,
  floatingGround: false,
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
export type { DialogBoxSettings };
