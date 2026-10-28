/* @layer renderer-app @kind config */
import type { ScreenMeta, Section } from '@drizztdourden08/brock-react';
import { withOwnRows } from '@app/settings-controls/own-row-sections';

const meta: ScreenMeta = { title: 'Graphics', icon: 'palette', order: 2, keywords: ['graphics', 'renderer', 'filter', 'sprite', 'mode 7', 'rupees'] };

const sections: Section[] = [
  {
    id: 'rendering',
    title: 'Rendering',
    subsections: [
      {
        id: 'rendering-engine',
        title: 'Engine',
        items: [
          { key: 'newRenderer', label: 'Optimized PPU', description: 'Uses a faster pixel processing unit. Looks identical and runs much faster', keywords: 'ppu renderer engine optimized fast' },
          { key: 'enhancedMode7', label: 'Enhanced Mode 7', description: 'Render the world map and flying sequences at higher resolution with smooth rotation and scaling, replacing the original pixelated Mode 7 effect', keywords: 'mode7 map resolution hd smooth' },
          { key: 'noSpriteLimits', label: 'No Sprite Limit', description: 'Lifts the limit of 8 sprites per line, so busy scenes stop flickering', keywords: 'sprite limit scanline flicker' },
        ],
      },
      {
        id: 'rendering-quality',
        title: 'Quality',
        items: [
          { key: 'linearFiltering', label: 'Linear Filtering', description: 'Apply bilinear interpolation for smoother, less pixelated visuals. Turn it off for crisp pixel art', hint: 'Pixel Perfect turns it off.', keywords: 'filter smooth pixel crisp bilinear' },
          { key: 'dimFlashes', label: 'Dim Flashes', description: 'Reduces the intensity of screen flashes (lightning, boss hits). Helps with photosensitivity', keywords: 'flash dim reduce epilepsy accessibility' },
        ],
      },
    ],
  },
  {
    id: 'enhancements',
    title: 'Enhancements',
    subsections: [
      {
        id: 'enhancements-overworld',
        title: 'Overworld',
        items: [
          { key: 'overworldEdgeEffect', label: 'Edge Effect', description: 'Fill black borders with a blurred mirror reflection and animated decay effect instead of solid black', keywords: 'edge glow mirror blur voronoi overworld widescreen border' },
        ],
      },
      {
        id: 'enhancements-items',
        title: 'Items in the World',
        items: [
          { key: 'coloredRupees', label: 'Coloured Rupees', description: 'Show rupees waiting in the world as plain coloured gems, one colour per value, instead of the picture with the amount written beside it', keywords: 'rupee rupees colour color gem gold silver purple money drop' },
          { key: 'itemSheen', label: 'Item Sheen', description: 'Let items waiting in the world catch the light every second or so, so a pickup on the floor stands out from the scenery', keywords: 'sheen shine glint sparkle shimmer highlight item drop' },
        ],
      },
      {
        id: 'enhancements-indoor',
        title: 'Indoor / Dungeons',
        items: [
          { key: 'hideSpaceBeyondWalls', label: 'Hide Space Beyond Walls', description: 'Black out the space past the walls of a house, a cave or the sanctuary. The room itself and dungeons are untouched', keywords: 'hide space beyond walls backdrop background black indoor house cave sanctuary surround' },
        ],
      },
    ],
  },
  {
    id: 'appearance',
    title: 'Appearance',
    items: [
      { key: 'linkSprite', label: 'Player Sprite', description: 'Choose a custom player sprite from your library.', keywords: 'player sprite character appearance custom zspr' },
    ],
  },
];

export default withOwnRows(sections);
export { meta };
