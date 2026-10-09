/* @layer renderer-components @kind constants */
const STYLE_DESCRIPTION =
  'Original is the game\'s own HUD. Enhanced keeps the original look and adds the app-drawn HUD and pause menu. '
  + 'Modern adds the modern control scheme on top, with numbered slots and any item on any button.';

const NO_SPRITES =
  'No HUD sprites are extracted for this ROM, so no style can be drawn. Extract them to use the HUD.';

const TOO_NARROW =
  'Enhanced and Modern need a display of 16:9 or wider, because their life, magic and item groups and their '
  + 'full-screen menu sit in the side bands a narrower view does not have. Widen the aspect ratio in '
  + 'Display settings to use them.';

export { NO_SPRITES, STYLE_DESCRIPTION, TOO_NARROW };
