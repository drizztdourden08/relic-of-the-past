/* @layer renderer-components @kind logic */
import type { GameSettings } from '@rotp/features';
import { useDialogSettingsStore } from '@app/stores/dialog-settings-store';

const syncDialogStore = (s: GameSettings): void => {
  const vanilla = s.vanillaSafe === true;
  useDialogSettingsStore.getState().setDialogSettings({
    box: vanilla ? 'original' : s.dialogBox,
    font: s.dialogFont,
    fontScale: s.dialogFontScale,
    inkColor: s.dialogInkColor,
    strokeColor: s.dialogStrokeColor,
    strokeWidth: s.dialogStrokeWidth,
    highlightPrimary: s.hudHighlightPrimary,
    highlightSecondary: s.hudHighlightSecondary,
    boxOpacity: s.dialogBoxOpacity,
    floatingGround: s.dialogFloatingGround,
    introTelepathyGround: s.dialogIntroTelepathyGround,
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
    prompts: {
      speed: vanilla ? 1 : s.dialogSpeed,
      holdSpeed: s.dialogHoldSpeed,
      holdToAccelerate: !vanilla && s.dialogHoldToAccelerate,
      fillOnB: !vanilla && s.dialogFillOnB,
    },
    autoSkipDialog: s.autoSkipDialog,
  });
};

export { syncDialogStore };
