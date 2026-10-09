/* @layer shared-types @kind types */
import type { DialogHoldStop, DialogSpeedStop, DialogStrokeWidth, DialogBorder, DialogBorderThickness, DialogCorner, DialogCornerMark, DialogTexture, DialogTextureAnimation, DialogTextureSpeed } from '@rotp/game-data';

interface DialogSettings {
  dialogSpeed: DialogSpeedStop;
  dialogHoldSpeed: DialogHoldStop;
  dialogHoldToAccelerate: boolean;
  dialogFillOnB: boolean;
  dialogTypewriter: boolean;
  dialogBox: 'original' | 'enhanced';
  dialogButtonPrompts: boolean;
  dialogFont: 'original' | 'modern';
  dialogFontScale: 1 | 1.25 | 1.5 | 2;
  dialogInkColor: string;
  dialogStrokeColor: string;
  dialogStrokeWidth: DialogStrokeWidth;
  hudHighlightPrimary: string;
  hudHighlightSecondary: string;
  dialogBoxOpacity: number;
  dialogFloatingGround: boolean;
  dialogIntroTelepathyGround: boolean;
  dialogGroundFade: boolean;
  dialogBoxFit: 'full' | 'message' | 'fit';
  dialogGroundColor: string;
  dialogBorder: DialogBorder;
  dialogBorderThickness: DialogBorderThickness;
  dialogBorderColor: string;
  dialogCorner: DialogCorner;
  dialogCornerMark: DialogCornerMark;
  dialogCornerMarkAngle: number;
  dialogTexture: DialogTexture;
  dialogTextureColor: string;
  dialogTextureOpacity: number;
  dialogTextureAnimation: DialogTextureAnimation;
  dialogTextureSpeed: DialogTextureSpeed;
  dialogTextureScale: number;
  dialogTextureDensity: number;
  dialogTextureScatter: number;
}

export type { DialogSettings };
