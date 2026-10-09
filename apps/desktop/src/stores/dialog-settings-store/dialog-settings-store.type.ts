/* @layer renderer-stores @kind types */
import type { PromptControls, DialogBorder, DialogBorderThickness, DialogCorner, DialogCornerMark, DialogTexture, DialogTextureAnimation, DialogTextureSpeed } from '@rotp/game-data';

interface DialogBoxSettings {
  box: 'original' | 'enhanced';
  font: 'original' | 'modern';
  fontScale: number;
  inkColor: string;
  strokeColor: string;
  strokeWidth: number;
  highlightPrimary: string;
  highlightSecondary: string;
  boxOpacity: number;
  floatingGround: boolean;
  introTelepathyGround: boolean;
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
  buttonPrompts: boolean;
  prompts: PromptControls;
  autoSkipDialog: boolean;
}

interface DialogSettingsStore extends DialogBoxSettings {
  setDialogSettings: (patch: Partial<DialogBoxSettings>) => void;
}

export type { DialogBoxSettings, DialogSettingsStore };
