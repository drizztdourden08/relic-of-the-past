/* @layer renderer-components @kind logic */
/** Section/subsection config for the HUD settings tab. */
import type { Section } from '../../../compounds/SettingsLayout';

const SECTIONS: Section[] = [
  {
    id: 'hud-display',
    title: 'Display',
    subsections: [
      {
        id: 'hud-general',
        title: 'General',
        items: [
          { key: 'hudMode', label: 'HUD Mode', description: 'Original renders the HUD on the game canvas. Enhanced replaces selected parts with a high-quality overlay that supports widescreen and smooth animations.', keywords: 'hud mode original enhanced overlay' },
          { key: 'hudEnhancedParts', label: 'Enhanced Parts', description: 'Choose which HUD components are replaced by the enhanced overlay. Parts not selected will continue using the original game rendering.', keywords: 'hud parts main pause enhanced toggle' },
          { key: 'hudStyle', label: 'Style', description: 'Visual theme applied to the enhanced overlay', keywords: 'hud style vanilla modern theme' },
          { key: 'hudRatio', label: 'Aspect Ratio', description: 'Aspect ratio for the enhanced overlay. Match keeps it in sync with the game viewport.', keywords: 'hud ratio aspect match widescreen' },
        ],
      },
    ],
  },
  {
    id: 'hud-main',
    title: 'Main HUD',
    subsections: [
      {
        id: 'hud-main-elements',
        title: 'Elements',
        items: [
          { key: 'hudHeartMode', label: 'Heart Style', description: 'How life hearts are drawn. Smooth fills fractional hearts gradually instead of in 4 steps.', keywords: 'heart life health style smooth' },
          { key: 'hudMagicMode', label: 'Magic Meter', description: 'How the magic power bar is rendered. Accurate shows the true value instead of rounding to 1/8ths.', keywords: 'magic meter style bar accurate' },
          { key: 'hudCountLayout', label: 'Counter Layout', description: 'Position of the rupee, bomb, arrow, and key counters relative to the screen.', keywords: 'counter layout position center original rupee bomb arrow key' },
        ],
      },
    ],
  },
  {
    id: 'hud-pause',
    title: 'Pause Menu',
    subsections: [
      {
        id: 'pause-options',
        title: 'Options',
        items: [
          { key: 'hudPauseHighlight', label: 'Item Highlight', description: 'How the currently selected item is indicated in the pause menu grid.', keywords: 'pause item highlight box glow selection cursor' },
        ],
      },
    ],
  },
];

export { SECTIONS };
