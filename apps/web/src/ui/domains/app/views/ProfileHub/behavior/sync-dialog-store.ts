/* @layer renderer-components @kind logic */
/**
 * Mirrors the dialog settings into the overlay's store: the message box look, plus the pacing
 * controls the button prompts describe. Vanilla Safe stands the overlay down the way it does the HUD:
 * it masks the override the enhanced box hides the native one through, so the overlay reads 'original'
 * while the saved preference stays put.
 */
import type { GameSettings } from '@shared/types/settings';
import { useDialogSettingsStore } from '../../../../../../stores/dialog-settings-store';

const DIALOG_BOX_KEYS = [
  'dialogBox', 'dialogFont', 'dialogFontScale', 'dialogInkColor', 'dialogStrokeColor', 'dialogStrokeWidth',
  'dialogBoxOpacity', 'dialogFloatingGround', 'dialogGroundFade', 'dialogBoxFit', 'dialogGroundColor', 'dialogBorder', 'dialogBorderThickness', 'dialogBorderColor',
  'dialogCorner', 'dialogCornerMark', 'dialogCornerMarkAngle', 'dialogTexture', 'dialogTextureColor', 'dialogTextureOpacity',
  'dialogTextureAnimation', 'dialogTextureSpeed', 'dialogTextureScale', 'dialogTextureDensity', 'dialogTextureScatter',
  'dialogButtonPrompts', 'dialogSpeed', 'dialogHoldSpeed', 'dialogHoldToAccelerate', 'dialogFillOnB',
  'autoSkipDialog', 'vanillaSafe',
] as const;

const syncDialogStore = (s: GameSettings): void => {
  const vanilla = s.vanillaSafe === true;
  useDialogSettingsStore.getState().setDialogSettings({
    box: vanilla ? 'original' : s.dialogBox,
    font: s.dialogFont,
    fontScale: s.dialogFontScale,
    inkColor: s.dialogInkColor,
    strokeColor: s.dialogStrokeColor,
    strokeWidth: s.dialogStrokeWidth,
    boxOpacity: s.dialogBoxOpacity,
    floatingGround: s.dialogFloatingGround,
    groundFade: s.dialogGroundFade,
    boxFit: s.dialogBoxFit,
    groundColor: s.dialogGroundColor,
    border: s.dialogBorder,
    borderThickness: s.dialogBorderThickness,
    borderTint: s.dialogBorderColor,
    corner: s.dialogCorner,
    cornerMark: s.dialogCornerMark,
    cornerMarkAngle: s.dialogCornerMarkAngle,
    texture: s.dialogTexture,
    textureColor: s.dialogTextureColor,
    textureOpacity: s.dialogTextureOpacity,
    textureAnimation: s.dialogTextureAnimation,
    textureSpeed: s.dialogTextureSpeed,
    textureScale: s.dialogTextureScale,
    textureDensity: s.dialogTextureDensity,
    textureScatter: s.dialogTextureScatter,
    buttonPrompts: s.dialogButtonPrompts,
    // Vanilla Safe masks the pacing gate too, so none of these controls act and none are prompted.
    prompts: {
      speed: vanilla ? 1 : s.dialogSpeed,
      holdSpeed: s.dialogHoldSpeed,
      holdToAccelerate: !vanilla && s.dialogHoldToAccelerate,
      fillOnB: !vanilla && s.dialogFillOnB,
    },
    autoSkipDialog: s.autoSkipDialog,
  });
};

const touchesDialogStore = (patch: Partial<GameSettings>): boolean => DIALOG_BOX_KEYS.some((k) => k in patch);

export { syncDialogStore, touchesDialogStore };
