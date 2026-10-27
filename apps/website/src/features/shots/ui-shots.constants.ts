/* @layer website-site @kind data */
import type { Screenshot } from '../screenshot.type';

const UI_SHOTS = {
  appWidgets: {
    id: 'ui-app',
    src: 'media/shots/ui-app.webp',
    width: 1920,
    height: 1040,
    alt: 'The app with the game running and its widgets docked on both sides',
  },
  appMap: {
    id: 'ui-app-map',
    src: 'media/shots/ui-app-map.webp',
    width: 1920,
    height: 1040,
    alt: 'The world map with the Checks and Inventory widgets docked beside it',
  },
  settingsGraphics: {
    id: 'ui-settings-graphics',
    src: 'media/shots/ui-settings-graphics.webp',
    width: 1790,
    height: 912,
    alt: 'The settings screen on Graphics, with every category listed in the sidebar',
  },
  settingsHud: {
    id: 'ui-settings-hud',
    src: 'media/shots/ui-settings-hud.webp',
    width: 1790,
    height: 912,
    alt: 'The HUD settings: mode, enhanced parts, style and layout options',
  },
  controlsMapping: {
    id: 'ui-controls',
    src: 'media/shots/ui-controls.webp',
    width: 1790,
    height: 912,
    alt: 'The controls page with all twelve SNES actions, each with its button and key',
  },
  controllers: {
    id: 'ui-controllers',
    src: 'media/shots/ui-controllers.webp',
    width: 1790,
    height: 912,
    alt: 'The controllers screen with an Xbox pad drawn out and every button labelled',
  },
  gameplayFixes: {
    id: 'ui-gameplay',
    src: 'media/shots/ui-gameplay.webp',
    width: 1790,
    height: 690,
    alt: 'The gameplay settings for movement and combat, one switch per fix',
  },
  checksOpen: {
    id: 'ui-checks-open',
    src: 'media/shots/ui-checks-open.webp',
    width: 1920,
    height: 1040,
    alt: 'The Checks tracker with the Eastern Palace opened, each check with the item placed there',
  },
  msuStudio: {
    id: 'ui-msu',
    src: 'media/shots/ui-msu.webp',
    width: 1790,
    height: 912,
    alt: 'MSU Studio with a new pack and its track slots listed',
  },
  spriteStudio: {
    id: 'ui-sprite',
    src: 'media/shots/ui-sprite.webp',
    width: 1790,
    height: 912,
    alt: 'The Player Sprite Studio with Link walking in four directions beside the palette',
  },
  spriteSheet: {
    id: 'ui-sprite-sheet',
    src: 'media/shots/ui-sprite-sheet.webp',
    width: 1790,
    height: 912,
    alt: 'The Player Sprite Studio showing the tile sheet of the sprite',
  },
  languageStudio: {
    id: 'ui-language',
    src: 'media/shots/ui-language.webp',
    width: 1790,
    height: 912,
    alt: 'The Language Studio with a dialogue line open for editing',
  },
  hookshop: {
    id: 'ui-hookshop',
    src: 'media/shots/ui-hookshop.webp',
    width: 680,
    height: 620,
    alt: 'The Hookshop site',
  },
  sanctuary: {
    id: 'ui-sanctuary',
    src: 'media/shots/ui-sanctuary.webp',
    width: 680,
    height: 460,
    alt: 'The Sanctuary site',
  },
} as const satisfies Record<string, Screenshot>;

export { UI_SHOTS };
