/* @layer renderer-app @kind config */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { ScreenMeta, SectionDef } from '@drizztdourden08/brock-react';

const meta: ScreenMeta = { title: msg('settings-hud:screen.title'), icon: 'layout-grid', order: 3, keywords: ['hud', 'hearts', 'magic', 'dialog box', 'title screen', 'overlay'] };

const drawChoices = [{ value: 'original', label: msg('settings-hud:option.draw-choices.original.label') }, { value: 'enhanced', label: msg('settings-hud:option.draw-choices.enhanced.label') }];
const enhancedParts = [{ value: 'main', label: msg('settings-hud:option.enhanced-parts.main.label') }, { value: 'pause', label: msg('settings-hud:option.enhanced-parts.pause.label') }];
const titleScreens = [{ value: 'original', label: msg('settings-hud:option.title-screens.original.label') }, { value: 'reimagined', label: msg('settings-hud:option.title-screens.reimagined.label') }];
const originalTitles = [{ value: 'us', label: msg('settings-hud:option.original-titles.us.label') }, { value: 'ja', label: msg('settings-hud:option.original-titles.ja.label') }];
const titleMotions = [{ value: 'still', label: msg('settings-hud:option.title-motions.still.label') }, { value: 'drifting', label: msg('settings-hud:option.title-motions.drifting.label') }];
const heartModes = [{ value: 'original', label: msg('settings-hud:option.heart-modes.original.label') }, { value: 'smooth', label: msg('settings-hud:option.heart-modes.smooth.label') }];
const magicModes = [{ value: 'original', label: msg('settings-hud:option.magic-modes.original.label') }, { value: 'accurate', label: msg('settings-hud:option.magic-modes.accurate.label') }];
const countLayouts = [{ value: 'centered', label: msg('settings-hud:option.count-layouts.centered.label') }, { value: 'original', label: msg('settings-hud:option.count-layouts.original.label') }];
const countdownStyles = [{ value: 'pixel', label: msg('settings-hud:option.countdown-styles.pixel.label') }, { value: 'smooth', label: msg('settings-hud:option.countdown-styles.smooth.label') }];
const boxFits = [{ value: 'full', label: msg('settings-hud:option.box-fits.full.label') }, { value: 'message', label: msg('settings-hud:option.box-fits.message.label') }, { value: 'fit', label: msg('settings-hud:option.box-fits.fit.label') }];
const fonts = [{ value: 'original', label: msg('settings-hud:option.fonts.original.label') }, { value: 'modern', label: msg('settings-hud:option.fonts.modern.label') }];
const borders = [{ value: 'original', label: msg('settings-hud:option.borders.original.label') }, { value: 'none', label: msg('settings-hud:option.borders.none.label') }, { value: 'single', label: msg('settings-hud:option.borders.single.label') }, { value: 'double', label: msg('settings-hud:option.borders.double.label') }];
const thicknesses = [{ value: 'thin', label: msg('settings-hud:option.thicknesses.thin.label') }, { value: 'medium', label: msg('settings-hud:option.thicknesses.medium.label') }, { value: 'thick', label: msg('settings-hud:option.thicknesses.thick.label') }];
const corners = [{ value: 'square', label: msg('settings-hud:option.corners.square.label') }, { value: 'rounded', label: msg('settings-hud:option.corners.rounded.label') }, { value: 'chamfered', label: msg('settings-hud:option.corners.chamfered.label') }];
const marks = [{ value: 'none', label: msg('settings-hud:option.marks.none.label') }, { value: 'circle', label: msg('settings-hud:option.marks.circle.label') }, { value: 'square', label: msg('settings-hud:option.marks.square.label') }, { value: 'triforce', label: msg('settings-hud:option.marks.triforce.label') }];
const textures = [
  { value: 'none', label: msg('settings-hud:option.textures.none.label') }, { value: 'triforce-outline', label: msg('settings-hud:option.textures.triforce-outline.label') }, { value: 'triforce-filled', label: msg('settings-hud:option.textures.triforce-filled.label') },
  { value: 'hex', label: msg('settings-hud:option.textures.hex.label') }, { value: 'scanlines', label: msg('settings-hud:option.textures.scanlines.label') }, { value: 'stripes', label: msg('settings-hud:option.textures.stripes.label') },
];
const animations = [{ value: 'none', label: msg('settings-hud:option.animations.none.label') }, { value: 'scroll', label: msg('settings-hud:option.animations.scroll.label') }, { value: 'drift', label: msg('settings-hud:option.animations.drift.label') }, { value: 'twinkle', label: msg('settings-hud:option.animations.twinkle.label') }, { value: 'pulse', label: msg('settings-hud:option.animations.pulse.label') }];
const speeds = [{ value: 'slow', label: msg('settings-hud:option.speeds.slow.label') }, { value: 'normal', label: msg('settings-hud:option.speeds.normal.label') }, { value: 'fast', label: msg('settings-hud:option.speeds.fast.label') }];

const percent = (value: number): string => `${Math.round(value * 100)}%`;
const wholePercent = (value: number): string => `${value}%`;
const degrees = (value: number): string => `${value} deg`;

const sections: SectionDef[] = [
  {
    id: 'hud-title',
    title: msg('settings-hud:section.hud-title.title'),
    items: [
      { key: 'titleScreen', label: msg('settings-hud:title-screen.label'), description: msg('settings-hud:title-screen.description'), hint: msg('settings-hud:title-screen.hint'), keywords: 'title screen intro reimagined original scene logo sword', control: { kind: 'choice', options: titleScreens } },
      { key: 'originalTitle', label: msg('settings-hud:original-title.label'), description: msg('settings-hud:original-title.description'), keywords: 'title screen original japanese us cartridge logo plate', control: { kind: 'choice', options: originalTitles } },
      { key: 'titleMotion', label: msg('settings-hud:title-motion.label'), description: msg('settings-hud:title-motion.description'), keywords: 'title motion parallax drift clouds still', control: { kind: 'choice', options: titleMotions } },
      { key: 'titleSword', label: msg('settings-hud:title-sword.label'), description: msg('settings-hud:title-sword.description'), hint: msg('settings-hud:title-sword.hint'), keywords: 'title sword fighter master tempered golden progress' },
      { key: 'titleFollowsProgress', label: msg('settings-hud:title-follows-progress.label'), description: msg('settings-hud:title-follows-progress.description'), keywords: 'title progress save sword tier dark world' },
    ],
  },
  {
    id: 'hud-display',
    title: msg('settings-hud:section.hud-display.title'),
    items: [
      { key: 'hudMode', label: msg('settings-hud:hud-mode.label'), description: msg('settings-hud:hud-mode.description'), keywords: 'hud mode original enhanced overlay', control: { kind: 'choice', options: drawChoices } },
      { key: 'hudEnhancedParts', label: msg('settings-hud:hud-enhanced-parts.label'), description: msg('settings-hud:hud-enhanced-parts.description'), keywords: 'hud parts main pause enhanced toggle', control: { kind: 'multi', options: enhancedParts } },
      { key: 'hudStyle', label: msg('settings-hud:hud-style.label'), description: msg('settings-hud:hud-style.description'), keywords: 'hud style original modern theme sprites widescreen pause menu control scheme slots' },
      { key: 'hudRatio', label: msg('settings-hud:hud-ratio.label'), description: msg('settings-hud:hud-ratio.description'), keywords: 'hud ratio aspect match widescreen' },
    ],
  },
  {
    id: 'hud-main',
    title: msg('settings-hud:section.hud-main.title'),
    items: [
      { key: 'hudHeartMode', label: msg('settings-hud:hud-heart-mode.label'), description: msg('settings-hud:hud-heart-mode.description'), keywords: 'heart life health style smooth', control: { kind: 'choice', options: heartModes } },
      { key: 'hudMagicMode', label: msg('settings-hud:hud-magic-mode.label'), description: msg('settings-hud:hud-magic-mode.description'), keywords: 'magic meter style bar accurate', control: { kind: 'choice', options: magicModes } },
      { key: 'hudCountLayout', label: msg('settings-hud:hud-count-layout.label'), description: msg('settings-hud:hud-count-layout.description'), keywords: 'counter layout position center original rupee bomb arrow key', control: { kind: 'choice', options: countLayouts } },
      { key: 'hudCountdownStyle', label: msg('settings-hud:hud-countdown-style.label'), description: msg('settings-hud:hud-countdown-style.description'), keywords: 'countdown timer pie pixel smooth digging super bomb', control: { kind: 'choice', options: countdownStyles } },
    ],
  },
  {
    id: 'hud-dialog',
    title: msg('settings-hud:section.hud-dialog.title'),
    subsections: [
      {
        id: 'hud-dialog-box',
        title: msg('settings-hud:section.hud-dialog-box.title'),
        items: [
          { key: 'dialogBox', label: msg('settings-hud:dialog-box.label'), description: msg('settings-hud:dialog-box.description'), keywords: 'dialog box message text overlay enhanced original', control: { kind: 'choice', options: drawChoices } },
          { key: 'dialogBoxFit', label: msg('settings-hud:dialog-box-fit.label'), description: msg('settings-hud:dialog-box-fit.description'), keywords: 'dialog box frame fit full message width shrink size', control: { kind: 'choice', options: boxFits } },
          { key: 'dialogButtonPrompts', label: msg('settings-hud:dialog-button-prompts.label'), description: msg('settings-hud:dialog-button-prompts.description'), keywords: 'dialog box button prompts controls hints legend guide' },
        ],
      },
      {
        id: 'hud-dialog-text',
        title: msg('settings-hud:section.hud-dialog-text.title'),
        items: [
          { key: 'dialogFont', label: msg('settings-hud:dialog-font.label'), description: msg('settings-hud:dialog-font.description'), keywords: 'dialog font glyph modern original text', control: { kind: 'choice', options: fonts } },
          { key: 'dialogFontScale', label: msg('settings-hud:dialog-font-scale.label'), description: msg('settings-hud:dialog-font-scale.description'), keywords: 'dialog font size scale large small text' },
          { key: 'dialogInkColor', label: msg('settings-hud:dialog-ink-color.label'), description: msg('settings-hud:dialog-ink-color.description'), keywords: 'dialog ink color colour text font' },
          { key: 'dialogStrokeColor', label: msg('settings-hud:dialog-stroke-color.label'), description: msg('settings-hud:dialog-stroke-color.description'), keywords: 'dialog stroke outline color colour text font' },
          { key: 'dialogStrokeWidth', label: msg('settings-hud:dialog-stroke-width.label'), description: msg('settings-hud:dialog-stroke-width.description'), keywords: 'dialog stroke outline width thickness text font' },
        ],
      },
      {
        id: 'hud-dialog-highlight',
        title: msg('settings-hud:section.hud-dialog-highlight.title'),
        items: [
          { key: 'hudHighlightPrimary', label: msg('settings-hud:hud-highlight-primary.label'), description: msg('settings-hud:hud-highlight-primary.description'), keywords: 'dialog highlight primary color colour item name randomizer message gold' },
          { key: 'hudHighlightSecondary', label: msg('settings-hud:hud-highlight-secondary.label'), description: msg('settings-hud:hud-highlight-secondary.description'), keywords: 'dialog highlight secondary color colour player name randomizer multiworld message green' },
        ],
      },
      {
        id: 'hud-dialog-border',
        title: msg('settings-hud:section.hud-dialog-border.title'),
        items: [
          { key: 'dialogBorder', label: msg('settings-hud:dialog-border.label'), description: msg('settings-hud:dialog-border.description'), hint: msg('settings-hud:dialog-border.hint'), keywords: 'dialog box border frame single double none original', control: { kind: 'choice', options: borders } },
          { key: 'dialogBorderThickness', label: msg('settings-hud:dialog-border-thickness.label'), description: msg('settings-hud:dialog-border-thickness.description'), keywords: 'dialog box border thickness thin thick', control: { kind: 'choice', options: thicknesses } },
          { key: 'dialogBorderColor', label: msg('settings-hud:dialog-border-color.label'), description: msg('settings-hud:dialog-border-color.description'), keywords: 'dialog box border color colour' },
          { key: 'dialogCorner', label: msg('settings-hud:dialog-corner.label'), description: msg('settings-hud:dialog-corner.description'), keywords: 'dialog box corner square rounded chamfered chamfer', control: { kind: 'choice', options: corners } },
          { key: 'dialogCornerMark', label: msg('settings-hud:dialog-corner-mark.label'), description: msg('settings-hud:dialog-corner-mark.description'), keywords: 'dialog box corner mark decoration circle square triforce', control: { kind: 'choice', options: marks } },
          { key: 'dialogCornerMarkAngle', label: msg('settings-hud:dialog-corner-mark-angle.label'), description: msg('settings-hud:dialog-corner-mark-angle.description'), keywords: 'dialog box corner mark angle rotate rotation', control: { kind: 'range', min: 0, max: 345, step: 15, format: degrees } },
        ],
      },
      {
        id: 'hud-dialog-background',
        title: msg('settings-hud:section.hud-dialog-background.title'),
        items: [
          { key: 'dialogGroundColor', label: msg('settings-hud:dialog-ground-color.label'), description: msg('settings-hud:dialog-ground-color.description'), keywords: 'dialog box background color colour ground' },
          { key: 'dialogBoxOpacity', label: msg('settings-hud:dialog-box-opacity.label'), description: msg('settings-hud:dialog-box-opacity.description'), keywords: 'dialog box background opacity translucent transparent', control: { kind: 'range', min: 0, max: 1, step: 0.05, format: percent } },
          { key: 'dialogGroundFade', label: msg('settings-hud:dialog-ground-fade.label'), description: msg('settings-hud:dialog-ground-fade.description'), keywords: 'dialog box background fade feather soft edges vignette' },
          { key: 'dialogFloatingGround', label: msg('settings-hud:dialog-floating-ground.label'), description: msg('settings-hud:dialog-floating-ground.description'), keywords: 'dialog box background telepathy floating borderless zelda' },
          { key: 'dialogIntroTelepathyGround', label: msg('settings-hud:dialog-intro-telepathy-ground.label'), description: msg('settings-hud:dialog-intro-telepathy-ground.description'), keywords: 'dialog box background telepathy intro opening bed zelda link house' },
        ],
      },
      {
        id: 'hud-dialog-texture',
        title: msg('settings-hud:section.hud-dialog-texture.title'),
        items: [
          { key: 'dialogTexture', label: msg('settings-hud:dialog-texture.label'), description: msg('settings-hud:dialog-texture.description'), hint: msg('settings-hud:dialog-texture.hint'), keywords: 'dialog box texture pattern triforce hex scanlines stripes', control: { kind: 'choice', options: textures } },
          { key: 'dialogTextureColor', label: msg('settings-hud:dialog-texture-color.label'), description: msg('settings-hud:dialog-texture-color.description'), keywords: 'dialog box texture pattern color colour' },
          { key: 'dialogTextureOpacity', label: msg('settings-hud:dialog-texture-opacity.label'), description: msg('settings-hud:dialog-texture-opacity.description'), keywords: 'dialog box texture pattern opacity', control: { kind: 'range', min: 0, max: 1, step: 0.05, format: percent } },
          { key: 'dialogTextureAnimation', label: msg('settings-hud:dialog-texture-animation.label'), description: msg('settings-hud:dialog-texture-animation.description'), keywords: 'dialog box texture animation scroll drift twinkle pulse still', control: { kind: 'choice', options: animations } },
          { key: 'dialogTextureSpeed', label: msg('settings-hud:dialog-texture-speed.label'), description: msg('settings-hud:dialog-texture-speed.description'), keywords: 'dialog box texture animation speed slow fast', control: { kind: 'choice', options: speeds } },
        ],
      },
      {
        id: 'hud-dialog-pattern',
        title: msg('settings-hud:section.hud-dialog-pattern.title'),
        items: [
          { key: 'dialogTextureScale', label: msg('settings-hud:dialog-texture-scale.label'), description: msg('settings-hud:dialog-texture-scale.description'), keywords: 'dialog box texture pattern size scale' },
          { key: 'dialogTextureDensity', label: msg('settings-hud:dialog-texture-density.label'), description: msg('settings-hud:dialog-texture-density.description'), keywords: 'dialog box texture pattern density spacing gap', control: { kind: 'range', min: 0, max: 100, step: 5, format: wholePercent } },
          { key: 'dialogTextureScatter', label: msg('settings-hud:dialog-texture-scatter.label'), description: msg('settings-hud:dialog-texture-scatter.description'), keywords: 'dialog box texture pattern scatter random jitter loose tight', control: { kind: 'range', min: 0, max: 100, step: 5, format: wholePercent } },
        ],
      },
    ],
  },
];

export default sections;
export { meta };
