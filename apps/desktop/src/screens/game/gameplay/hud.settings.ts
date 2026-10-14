/* @layer renderer-app @kind config */
import type { ScreenMeta, Section } from '@drizztdourden08/brock-react';

const meta: ScreenMeta = { title: 'HUD', icon: 'layout-grid', order: 3, keywords: ['hud', 'hearts', 'magic', 'dialog box', 'title screen', 'overlay'] };

const drawChoices = [{ value: 'original', label: 'Original' }, { value: 'enhanced', label: 'Enhanced' }];
const enhancedParts = [{ value: 'main', label: 'Main' }, { value: 'pause', label: 'Pause' }];
const titleScreens = [{ value: 'original', label: 'Original' }, { value: 'reimagined', label: 'Reimagined' }];
const titleMotions = [{ value: 'still', label: 'Still' }, { value: 'drifting', label: 'Drifting' }];
const heartModes = [{ value: 'original', label: 'Original' }, { value: 'smooth', label: 'Smooth' }];
const magicModes = [{ value: 'original', label: 'Original' }, { value: 'accurate', label: 'Accurate' }];
const countLayouts = [{ value: 'centered', label: 'Centered' }, { value: 'original', label: 'Original' }];
const countdownStyles = [{ value: 'pixel', label: 'Pixel' }, { value: 'smooth', label: 'Smooth' }];
const boxFits = [{ value: 'full', label: 'Full' }, { value: 'message', label: 'Message' }, { value: 'fit', label: 'Fit' }];
const fonts = [{ value: 'original', label: 'Original' }, { value: 'modern', label: 'Modern' }];
const borders = [{ value: 'original', label: 'Original' }, { value: 'none', label: 'None' }, { value: 'single', label: 'Single' }, { value: 'double', label: 'Double' }];
const thicknesses = [{ value: 'thin', label: 'Thin' }, { value: 'medium', label: 'Medium' }, { value: 'thick', label: 'Thick' }];
const corners = [{ value: 'square', label: 'Square' }, { value: 'rounded', label: 'Rounded' }, { value: 'chamfered', label: 'Chamfered' }];
const marks = [{ value: 'none', label: 'None' }, { value: 'circle', label: 'Circle' }, { value: 'square', label: 'Square' }, { value: 'triforce', label: 'Triforce' }];
const textures = [
  { value: 'none', label: 'None' }, { value: 'triforce-outline', label: 'Triforce' }, { value: 'triforce-filled', label: 'Triforce Filled' },
  { value: 'hex', label: 'Hex' }, { value: 'scanlines', label: 'Scanlines' }, { value: 'stripes', label: 'Stripes' },
];
const animations = [{ value: 'none', label: 'Still' }, { value: 'scroll', label: 'Scroll' }, { value: 'drift', label: 'Drift' }, { value: 'twinkle', label: 'Twinkle' }, { value: 'pulse', label: 'Pulse' }];
const speeds = [{ value: 'slow', label: 'Slow' }, { value: 'normal', label: 'Normal' }, { value: 'fast', label: 'Fast' }];

const percent = (value: number): string => `${Math.round(value * 100)}%`;
const wholePercent = (value: number): string => `${value}%`;
const degrees = (value: number): string => `${value} deg`;

const sections: Section[] = [
  {
    id: 'hud-title',
    title: 'Title Screen',
    items: [
      { key: 'titleScreen', label: 'Title Screen', description: "Original keeps the game's title. Reimagined draws a wider scene over the same sequence.", hint: 'Pick the title screen look. Reimagined unlocks the options below.', keywords: 'title screen intro reimagined original scene logo sword', control: { kind: 'choice', options: titleScreens } },
      { key: 'titleMotion', label: 'Motion', description: 'Drifting moves the scene and the clouds slowly while the title waits.', hint: 'Pick whether the reimagined scene drifts or stays still.', keywords: 'title motion parallax drift clouds still', control: { kind: 'choice', options: titleMotions } },
      { key: 'titleSword', label: 'Sword', description: 'The sword planted in the title. Progress picks it from the most advanced save.', hint: 'Press to step to the next sword shown in the title.', keywords: 'title sword fighter master tempered golden progress' },
      { key: 'titleFollowsProgress', label: 'Follows Progress', description: 'The world, and the sword set to Progress, come from the most advanced save.', hint: 'On, the title scene matches how far your best save has come.', keywords: 'title progress save sword tier dark world' },
    ],
  },
  {
    id: 'hud-display',
    title: 'Display',
    items: [
      { key: 'hudMode', label: 'HUD Mode', description: 'Original renders the HUD on the game canvas. Enhanced replaces selected parts with a high-quality overlay that supports widescreen and smooth animations.', hint: 'Pick Enhanced to draw the chosen HUD parts as a sharp overlay.', keywords: 'hud mode original enhanced overlay', control: { kind: 'choice', options: drawChoices } },
      { key: 'hudEnhancedParts', label: 'Enhanced Parts', description: 'Choose which HUD components are replaced by the enhanced overlay. Parts not selected will continue using the original game rendering.', hint: 'Pick the HUD parts the overlay draws. The others stay as the game draws them.', keywords: 'hud parts main pause enhanced toggle', control: { kind: 'multi', options: enhancedParts } },
      { key: 'hudStyle', label: 'Style', description: "Original is the game's own HUD. Enhanced keeps that look and hands the HUD and the pause menu to the app; Modern adds the modern control scheme on top. Both app-drawn styles need a 16:9 or wider display.", hint: 'Pick the HUD style. Enhanced and Modern need a 16:9 or wider picture.', keywords: 'hud style original enhanced modern theme sprites widescreen pause menu control scheme slots' },
      { key: 'hudRatio', label: 'Aspect Ratio', description: 'Aspect ratio for the enhanced overlay. Match keeps it in sync with the game viewport.', hint: 'Pick the shape of the area the overlay draws in.', keywords: 'hud ratio aspect match widescreen' },
    ],
  },
  {
    id: 'hud-main',
    title: 'Main HUD',
    items: [
      { key: 'hudHeartMode', label: 'Heart Style', description: 'How life hearts are drawn. Smooth fills fractional hearts gradually instead of in 4 steps.', hint: 'Pick Smooth to see partial hearts fill gradually.', keywords: 'heart life health style smooth', control: { kind: 'choice', options: heartModes } },
      { key: 'hudMagicMode', label: 'Magic Meter', description: 'How the magic power bar is rendered. Accurate shows the true value instead of rounding to 1/8ths.', hint: 'Pick Accurate to see the exact magic left.', keywords: 'magic meter style bar accurate', control: { kind: 'choice', options: magicModes } },
      { key: 'hudCountLayout', label: 'Counter Layout', description: 'Position of the rupee, bomb, arrow, and key counters relative to the screen.', hint: 'Pick where the rupee, bomb, arrow and key counters sit.', keywords: 'counter layout position center original rupee bomb arrow key', control: { kind: 'choice', options: countLayouts } },
      { key: 'hudCountdownStyle', label: 'Countdown Timer', description: 'How the countdown for timed events, such as the digging game or the super bomb, is drawn.', hint: 'Pick the look of the countdown timer.', keywords: 'countdown timer pie pixel smooth digging super bomb', control: { kind: 'choice', options: countdownStyles } },
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
          { key: 'dialogBox', label: 'Box', description: "Original keeps the game's box. Enhanced draws it as an overlay you can style.", hint: 'Pick Enhanced to style the message box with the options below.', keywords: 'dialog box message text overlay enhanced original', control: { kind: 'choice', options: drawChoices } },
          { key: 'dialogBoxFit', label: 'Size', description: 'Full keeps the original size. Message sizes the box once to the whole message. Fit follows the text as it types.', hint: 'Pick how wide the message box is.', keywords: 'dialog box frame fit full message width shrink size', control: { kind: 'choice', options: boxFits } },
          { key: 'dialogButtonPrompts', label: 'Button Prompts', description: 'Shows the buttons that act on a message under its box: choose, confirm, next, complete and faster.', hint: 'On, the buttons you can press show under each message.', keywords: 'dialog box button prompts controls hints legend guide' },
        ],
      },
      {
        id: 'hud-dialog-text',
        title: 'Text',
        items: [
          { key: 'dialogFont', label: 'Font', description: "Original uses the game's glyphs. Modern uses the app's dialogue font.", hint: 'Pick Modern to write messages in the app font.', keywords: 'dialog font glyph modern original text', control: { kind: 'choice', options: fonts } },
          { key: 'dialogFontScale', label: 'Font Size', description: 'How large the modern font draws.', hint: 'Drag to size the modern font.', keywords: 'dialog font size scale large small text' },
          { key: 'dialogInkColor', label: 'Ink Color', description: 'The colour the modern font is written in.', hint: 'Pick the colour of the modern text.', keywords: 'dialog ink color colour text font' },
          { key: 'dialogStrokeColor', label: 'Stroke Color', description: 'The outline colour around each modern glyph.', hint: 'Pick the colour of the outline around the text.', keywords: 'dialog stroke outline color colour text font' },
          { key: 'dialogStrokeWidth', label: 'Stroke Width', description: 'How thick the outline is, in game pixels.', hint: 'Drag to set the outline thickness.', keywords: 'dialog stroke outline width thickness text font' },
        ],
      },
      {
        id: 'hud-dialog-highlight',
        title: 'Highlights',
        items: [
          { key: 'hudHighlightPrimary', label: 'Highlight Primary', description: 'Item names in randomizer messages.', hint: 'Pick the colour of item names in randomizer messages.', keywords: 'dialog highlight primary color colour item name randomizer message gold' },
          { key: 'hudHighlightSecondary', label: 'Highlight Secondary', description: 'Player names in randomizer messages.', hint: 'Pick the colour of player names in randomizer messages.', keywords: 'dialog highlight secondary color colour player name randomizer multiworld message green' },
        ],
      },
      {
        id: 'hud-dialog-border',
        title: 'Border',
        items: [
          { key: 'dialogBorder', label: 'Border', description: "The game's tiles, no border, one line, or a thin line inside a thicker one.", hint: 'Pick the frame around the box. Single and Double unlock the line options.', keywords: 'dialog box border frame single double none original', control: { kind: 'choice', options: borders } },
          { key: 'dialogBorderThickness', label: 'Thickness', description: 'How heavy the drawn line is.', hint: 'Pick how heavy the border line is.', keywords: 'dialog box border thickness thin thick', control: { kind: 'choice', options: thicknesses } },
          { key: 'dialogBorderColor', label: 'Border Color', description: 'The colour of the drawn line and the corner marks.', hint: 'Pick the colour of the border and corner marks.', keywords: 'dialog box border color colour' },
          { key: 'dialogCorner', label: 'Corners', description: 'Square, rounded, or cut at a diagonal.', hint: 'Pick the shape of the box corners.', keywords: 'dialog box corner square rounded chamfered chamfer', control: { kind: 'choice', options: corners } },
          { key: 'dialogCornerMark', label: 'Corner Marks', description: 'A small mark inside each corner.', hint: 'Pick a mark to draw inside each corner.', keywords: 'dialog box corner mark decoration circle square triforce', control: { kind: 'choice', options: marks } },
          { key: 'dialogCornerMarkAngle', label: 'Mark Angle', description: 'Turns the marks; each corner mirrors the top-left one.', hint: 'Drag to turn the corner marks.', keywords: 'dialog box corner mark angle rotate rotation', control: { kind: 'range', min: 0, max: 345, step: 15, format: degrees } },
        ],
      },
      {
        id: 'hud-dialog-background',
        title: 'Background',
        items: [
          { key: 'dialogGroundColor', label: 'Background Color', description: 'The ground behind the text.', hint: 'Pick the colour behind the text.', keywords: 'dialog box background color colour ground' },
          { key: 'dialogBoxOpacity', label: 'Background Opacity', description: 'How solid the ground is, from clear to solid.', hint: 'Drag to make the background more or less see-through.', keywords: 'dialog box background opacity translucent transparent', control: { kind: 'range', min: 0, max: 1, step: 0.05, format: percent } },
          { key: 'dialogGroundFade', label: 'Fade Edges', description: 'Fades the background out toward its edges. Only without a border.', hint: 'On, the background fades out toward its edges.', keywords: 'dialog box background fade feather soft edges vignette' },
          { key: 'dialogFloatingGround', label: 'Behind Telepathy', description: 'Also draws the background behind borderless messages, such as telepathy.', hint: 'On, borderless messages get the background too.', keywords: 'dialog box background telepathy floating borderless zelda' },
          { key: 'dialogIntroTelepathyGround', label: 'Behind Intro Telepathy', description: 'Draws it behind the first telepathic call of the intro, while the hero is still in bed.', hint: 'On, the first call of the intro gets the background too.', keywords: 'dialog box background telepathy intro opening bed zelda link house' },
        ],
      },
      {
        id: 'hud-dialog-texture',
        title: 'Texture',
        items: [
          { key: 'dialogTexture', label: 'Pattern', description: 'A repeating pattern on the ground behind the text.', hint: 'Pick a pattern for the background. None turns the pattern options off.', keywords: 'dialog box texture pattern triforce hex scanlines stripes', control: { kind: 'choice', options: textures } },
          { key: 'dialogTextureColor', label: 'Pattern Color', description: 'The colour the pattern is drawn in.', hint: 'Pick the colour of the pattern.', keywords: 'dialog box texture pattern color colour' },
          { key: 'dialogTextureOpacity', label: 'Pattern Opacity', description: 'How visible the pattern is.', hint: 'Drag to make the pattern stronger or fainter.', keywords: 'dialog box texture pattern opacity', control: { kind: 'range', min: 0, max: 1, step: 0.05, format: percent } },
          { key: 'dialogTextureAnimation', label: 'Animation', description: 'Still, sliding, drifting, appearing at random, or breathing.', hint: 'Pick how the pattern moves.', keywords: 'dialog box texture animation scroll drift twinkle pulse still', control: { kind: 'choice', options: animations } },
          { key: 'dialogTextureSpeed', label: 'Animation Speed', description: 'How fast the pattern moves.', hint: 'Pick how fast the pattern moves.', keywords: 'dialog box texture animation speed slow fast', control: { kind: 'choice', options: speeds } },
        ],
      },
      {
        id: 'hud-dialog-pattern',
        title: 'Pattern Layout',
        items: [
          { key: 'dialogTextureScale', label: 'Size', description: 'How large each cell of the pattern draws.', hint: 'Drag to size the pattern cells.', keywords: 'dialog box texture pattern size scale' },
          { key: 'dialogTextureDensity', label: 'Density', description: 'How close the cells sit.', hint: 'Drag to pack the cells closer or spread them out.', keywords: 'dialog box texture pattern density spacing gap', control: { kind: 'range', min: 0, max: 100, step: 5, format: wholePercent } },
          { key: 'dialogTextureScatter', label: 'Scatter', description: 'How far cells stray from the grid; at zero they line up.', hint: 'Drag to let the cells stray from the grid.', keywords: 'dialog box texture pattern scatter random jitter loose tight', control: { kind: 'range', min: 0, max: 100, step: 5, format: wholePercent } },
        ],
      },
    ],
  },
];

export default sections;
export { meta };
