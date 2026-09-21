/* @layer renderer-components @kind logic */
/** Section config for the HUD settings tab. */
import type { Section } from '../../../compounds/SettingsLayout';

const SECTIONS: Section[] = [
  {
    id: 'hud-display',
    title: 'Display',
    items: [
      { key: 'hudMode', label: 'HUD Mode', description: 'Original renders the HUD on the game canvas. Enhanced replaces selected parts with a high-quality overlay that supports widescreen and smooth animations.', keywords: 'hud mode original enhanced overlay' },
      { key: 'hudEnhancedParts', label: 'Enhanced Parts', description: 'Choose which HUD components are replaced by the enhanced overlay. Parts not selected will continue using the original game rendering.', keywords: 'hud parts main pause enhanced toggle' },
      { key: 'hudStyle', label: 'Style', description: 'Visual theme applied to the enhanced overlay', keywords: 'hud style vanilla modern theme' },
      { key: 'hudRatio', label: 'Aspect Ratio', description: 'Aspect ratio for the enhanced overlay. Match keeps it in sync with the game viewport.', keywords: 'hud ratio aspect match widescreen' },
    ],
  },
  {
    id: 'hud-main',
    title: 'Main HUD',
    items: [
      { key: 'hudHeartMode', label: 'Heart Style', description: 'How life hearts are drawn. Smooth fills fractional hearts gradually instead of in 4 steps.', keywords: 'heart life health style smooth' },
      { key: 'hudMagicMode', label: 'Magic Meter', description: 'How the magic power bar is rendered. Accurate shows the true value instead of rounding to 1/8ths.', keywords: 'magic meter style bar accurate' },
      { key: 'hudCountLayout', label: 'Counter Layout', description: 'Position of the rupee, bomb, arrow, and key counters relative to the screen.', keywords: 'counter layout position center original rupee bomb arrow key' },
      { key: 'hudCountdownStyle', label: 'Countdown Timer', description: '', keywords: 'countdown timer pie pixel smooth digging super bomb' },
    ],
  },
  {
    id: 'hud-pause',
    title: 'Pause Menu',
    items: [
      { key: 'hudPauseStyle', label: 'Pause Style', description: 'Visual treatment of the pause menu. Vanilla keeps the original look; Enhanced uses the high-quality overlay.', keywords: 'pause style vanilla enhanced menu overlay' },
      { key: 'hudPauseHighlight', label: 'Item Highlight', description: 'How the currently selected item is indicated in the pause menu grid.', keywords: 'pause item highlight box glow selection cursor' },
    ],
  },
  {
    id: 'hud-dialog',
    title: 'Dialog Box',
    subsections: [
      {
        id: 'hud-dialog-box',
        title: 'Box',
        items: [
          { key: 'dialogBox', label: 'Box', description: 'Original keeps the game\'s box. Enhanced draws it as an overlay you can style.', keywords: 'dialog box message text overlay enhanced original' },
          { key: 'dialogBoxFit', label: 'Size', description: 'Full keeps the original size. Message sizes the box once to the whole message. Fit follows the text as it types.', keywords: 'dialog box frame fit full message width shrink size' },
          { key: 'dialogButtonPrompts', label: 'Button Prompts', description: 'Shows the buttons that act on a message under its box: choose, confirm, next, complete and faster.', keywords: 'dialog box button prompts controls hints legend guide' },
        ],
      },
      {
        id: 'hud-dialog-text',
        title: 'Text',
        items: [
          { key: 'dialogFont', label: 'Font', description: 'Original uses the game\'s glyphs. Modern uses the app\'s dialogue font.', keywords: 'dialog font glyph modern original text' },
          { key: 'dialogFontScale', label: 'Font Size', description: 'How large the modern font draws.', keywords: 'dialog font size scale large small text' },
          { key: 'dialogInkColor', label: 'Ink Color', description: 'The colour the modern font is written in.', keywords: 'dialog ink color colour text font' },
          { key: 'dialogStrokeColor', label: 'Stroke Color', description: 'The outline colour around each modern glyph.', keywords: 'dialog stroke outline color colour text font' },
          { key: 'dialogStrokeWidth', label: 'Stroke Width', description: 'How thick the outline is, in game pixels.', keywords: 'dialog stroke outline width thickness text font' },
        ],
      },
      {
        id: 'hud-dialog-border',
        title: 'Border',
        items: [
          { key: 'dialogBorder', label: 'Border', description: 'The game\'s tiles, no border, one line, or a thin line inside a thicker one.', keywords: 'dialog box border frame single double none original' },
          { key: 'dialogBorderThickness', label: 'Thickness', description: 'How heavy the drawn line is.', keywords: 'dialog box border thickness thin thick' },
          { key: 'dialogBorderColor', label: 'Border Color', description: 'The colour of the drawn line and the corner marks.', keywords: 'dialog box border color colour' },
          { key: 'dialogCorner', label: 'Corners', description: 'Square, rounded, or cut at a diagonal.', keywords: 'dialog box corner square rounded chamfered chamfer' },
          { key: 'dialogCornerMark', label: 'Corner Marks', description: 'A small mark inside each corner.', keywords: 'dialog box corner mark decoration circle square triforce' },
          { key: 'dialogCornerMarkAngle', label: 'Mark Angle', description: 'Turns the marks; each corner mirrors the top-left one.', keywords: 'dialog box corner mark angle rotate rotation' },
        ],
      },
      {
        id: 'hud-dialog-background',
        title: 'Background',
        items: [
          { key: 'dialogGroundColor', label: 'Background Color', description: 'The ground behind the text.', keywords: 'dialog box background color colour ground' },
          { key: 'dialogBoxOpacity', label: 'Background Opacity', description: 'How solid the ground is, from clear to solid.', keywords: 'dialog box background opacity translucent transparent' },
          { key: 'dialogGroundFade', label: 'Fade Edges', description: 'Fades the background out toward its edges. Only without a border.', keywords: 'dialog box background fade feather soft edges vignette' },
          { key: 'dialogFloatingGround', label: 'Behind Telepathy', description: 'Also draws the background behind borderless messages, such as telepathy.', keywords: 'dialog box background telepathy floating borderless zelda' },
          { key: 'dialogIntroTelepathyGround', label: 'Behind Intro Telepathy', description: "Draws it behind Zelda's first call, while Link is still in bed.", keywords: 'dialog box background telepathy intro opening bed zelda link house' },
        ],
      },
      {
        id: 'hud-dialog-texture',
        title: 'Texture',
        items: [
          { key: 'dialogTexture', label: 'Pattern', description: 'A repeating pattern on the ground behind the text.', keywords: 'dialog box texture pattern triforce hex scanlines stripes' },
          { key: 'dialogTextureColor', label: 'Pattern Color', description: 'The colour the pattern is drawn in.', keywords: 'dialog box texture pattern color colour' },
          { key: 'dialogTextureOpacity', label: 'Pattern Opacity', description: 'How visible the pattern is.', keywords: 'dialog box texture pattern opacity' },
          { key: 'dialogTextureAnimation', label: 'Animation', description: 'Still, sliding, drifting, appearing at random, or breathing.', keywords: 'dialog box texture animation scroll drift twinkle pulse still' },
          { key: 'dialogTextureSpeed', label: 'Animation Speed', description: 'How fast the pattern moves.', keywords: 'dialog box texture animation speed slow fast' },
        ],
      },
      {
        id: 'hud-dialog-pattern',
        title: 'Pattern Layout',
        items: [
          { key: 'dialogTextureScale', label: 'Size', description: 'How large each cell of the pattern draws.', keywords: 'dialog box texture pattern size scale' },
          { key: 'dialogTextureDensity', label: 'Density', description: 'How close the cells sit.', keywords: 'dialog box texture pattern density spacing gap' },
          { key: 'dialogTextureScatter', label: 'Scatter', description: 'How far cells stray from the grid; at zero they line up.', keywords: 'dialog box texture pattern scatter random jitter loose tight' },
        ],
      },
    ],
  },
];

export { SECTIONS };
