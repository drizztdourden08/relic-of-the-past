<!-- @layer docs @kind doc -->
<!-- @wiki-title: HUD Settings -->
# HUD Settings

These settings live in the HUD tab and are saved per profile.

## Display

**HUD Mode** chooses how the heads-up display is drawn. Original renders the HUD directly on the game canvas, while Enhanced replaces parts of it with a high-quality overlay that supports widescreen and smooth animation. The default is Original.

**Enhanced Parts** picks which HUD pieces use the enhanced overlay. You can select Main, Pause, or both, and anything you leave unselected keeps the original rendering. Both are selected by default.

**Style** sets the visual theme for the enhanced overlay. The choices are Vanilla and Modern, with Vanilla as the default. Modern is a future option.

**Aspect Ratio** controls the area the HUD occupies. Match keeps the HUD in sync with the game viewport, while a fixed ratio pins it to a narrower area. The options are Match, 4:3, 3:2, 16:9, 16:10, and 18:9, with Match as the default. Ratios wider than the screen are disabled.

## Main HUD

**Heart Style** sets how hearts fill. Original fills them in four steps, and Smooth fills partial hearts gradually. The default is Original.

**Magic Meter** sets how the magic value is shown. Original rounds to eighths, and Accurate shows the true magic value. The default is Original.

**Counter Layout** places the rupee, bomb, arrow, and key counters. You can choose Centered or Original, with Centered as the default.

## Pause Menu

**Item Highlight** marks the selected item in the pause grid. The options are Box, Glow, and None, with Box as the default.

## Dialog Box

These settings change only how the message box looks. They are not tied to HUD Mode: the enhanced box draws over the original HUD and the enhanced one alike. Every setting below the Box switch applies only with Enhanced.

### Box

**Box** chooses which message box is drawn. Original keeps the game's own box, while Enhanced draws it as an overlay you can style. The default is Original.

**Size** sets how the enhanced box is sized. Full keeps the original size. Message measures the whole message when it starts and sizes the box to its longest line and most rows, so the box keeps one size while the message plays. Fit follows the text as it types, and holds its size while a line scrolls. The default is Message.

**Button Prompts** shows, under the box on the right, the buttons that act on the message right now: the arrows and A on a choice, A for the next page, and, while a page is still typing, B to complete it and holding A to speed it up when those Gameplay settings are on. The prompts show the buttons you set up for the active input profile, so a controller profile shows that controller's buttons and a keyboard profile shows keys. It is off by default.

### Text

**Font** chooses the lettering. Original uses the game's glyphs, and Modern uses the app's dialogue font. The default is Original.

**Font Size** scales the modern font. The options are 1x, 1.25x, 1.5x, and 2x, with 1x as the default.

**Ink Color** and **Stroke Color** set the fill and outline of the modern font. Click a swatch to open the picker; the defaults are white ink and the game's blue stroke.

**Stroke Width** sets how thick that outline is, in game pixels, from none to 2. The default is 0.5.

### Border

**Border** picks what runs around the text: the game's own tiles, no border, a single line, or a thin line inside a thicker one. The default is the game's tiles.

**Thickness** makes a drawn line thin, medium, or thick. **Border Color** sets its colour, and the colour of the corner marks.

**Corners** are square, rounded, or chamfered, which cuts each corner at a diagonal. The ground follows the same shape.

**Corner Marks** put a small mark inside each corner: a circle, a square, or a triforce. The default is none. **Mark Angle** turns the marks in steps of 15 degrees from upright; the other three corners mirror the top-left one, so the four stay symmetrical.

### Background

**Background Color** sets the ground behind the text. The default is the game's near-black.

**Background Opacity** sets how solid that ground is, from fully clear to solid. The default is 70%.

**Behind Telepathy** also draws that ground behind borderless messages, such as a telepathic plea. It is on by default. **Behind Intro Telepathy** does the same for Zelda's first call, while Link is still in bed at the start of the game. It is off by default, so those opening words float over the dark room the way the game shows them. In the story told before the title screen, the legend over the pictures has no ground and the scenes after it do. The game-over menu never has one. The scene grounds always fade out at their edges, and so does the spawn picker shown when you start a game or continue after dying, which never has a border.

**Fade Edges** fades the ground out toward its edges for every other message. It only applies to a box without a border, and it is off by default. Both keep their words where the game puts them, so the story lines up with its scenes and the fairy still points at each choice.

### Texture

**Pattern** draws a repeating pattern on the ground: triforce outlines, filled triforces, a hexagonal grid, thin scanlines, or broad stripes. The default is none.

**Pattern Color** and **Pattern Opacity** set how the pattern is drawn. The default is a soft cyan at 25%.

### Pattern Layout

**Size** scales each cell of the pattern, from half to double. **Density** sets how close the cells sit. **Scatter** lets every cell stray from its grid seat by a fixed random amount and vary a little in size; at zero the cells line up, at full the field reads as strewn.

**Animation** moves the pattern: still, sliding sideways, drifting diagonally, cells appearing and fading at random, or the whole field breathing. **Animation Speed** runs it slow, normal, or fast. A system that asks for reduced motion keeps the pattern still.
