/* @layer renderer-app @kind config */
import type { ScreenMeta, Section } from '@drizztdourden08/brock-react';

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
          { key: 'newRenderer', label: 'Optimized PPU', description: 'Use a faster, rewritten pixel processing unit instead of the cycle-accurate SNES PPU. Looks identical and runs much faster', hint: 'On, the game draws with the faster renderer. The picture looks the same.', keywords: 'ppu renderer engine optimized fast' },
          { key: 'enhancedMode7', label: 'Enhanced Mode 7', description: 'Render the world map and flying sequences at higher resolution with smooth rotation and scaling, replacing the original pixelated Mode 7 effect', hint: 'On, the world map and the flight scenes draw at a higher resolution.', keywords: 'mode7 map resolution hd smooth' },
          { key: 'noSpriteLimits', label: 'No Sprite Limit', description: 'Remove the original SNES limitation of 8 sprites per scanline, so busy scenes stop flickering', hint: 'On, crowded scenes stop flickering because every sprite on a line is drawn.', keywords: 'sprite limit scanline flicker' },
        ],
      },
      {
        id: 'rendering-quality',
        title: 'Quality',
        items: [
          { key: 'linearFiltering', label: 'Linear Filtering', description: 'Apply bilinear interpolation for smoother, less pixelated visuals. Turn it off for crisp pixel art', hint: 'On, the scaled picture is smoothed. Off keeps sharp pixels. Pixel Perfect turns it off.', keywords: 'filter smooth pixel crisp bilinear' },
          { key: 'dimFlashes', label: 'Dim Flashes', description: 'Reduce the intensity of screen flashing effects (lightning, boss hits) similar to Virtual Console. Helps with photosensitivity', hint: 'On, lightning and other full screen flashes are softer.', keywords: 'flash dim reduce epilepsy accessibility' },
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
          { key: 'overworldEdgeEffect', label: 'Edge Effect', description: 'Fill black borders with a blurred mirror reflection and animated decay effect instead of solid black', hint: 'On, the black borders around the overworld show a blurred reflection of the scene.', keywords: 'edge glow mirror blur voronoi overworld widescreen border' },
        ],
      },
      {
        id: 'enhancements-items',
        title: 'Items in the World',
        items: [
          { key: 'coloredRupees', label: 'Coloured Rupees', description: 'Show rupees waiting in the world as plain coloured gems, one colour per value, instead of the picture with the amount written beside it', hint: 'On, rupees on the ground show their value by colour.', keywords: 'rupee rupees colour color gem gold silver purple money drop' },
          { key: 'itemSheen', label: 'Item Sheen', description: 'Let items waiting in the world catch the light every second or so, so a pickup on the floor stands out from the scenery', hint: 'On, items on the ground glint now and then so they are easier to spot.', keywords: 'sheen shine glint sparkle shimmer highlight item drop' },
        ],
      },
      {
        id: 'enhancements-indoor',
        title: 'Indoor / Dungeons',
        items: [
          { key: 'hideSpaceBeyondWalls', label: 'Hide Space Beyond Walls', description: 'Black out the space past the walls of a house, a cave or the sanctuary. The room itself and dungeons are untouched', hint: 'On, the area outside the walls of houses and caves turns black.', keywords: 'hide space beyond walls backdrop background black indoor house cave sanctuary surround' },
        ],
      },
    ],
  },
  {
    id: 'appearance',
    title: 'Appearance',
    items: [
      { key: 'linkSprite', label: 'Player Sprite', description: 'Choose a custom player sprite from your library.', hint: 'Pick the sprite the player is drawn with. The game switches to it at once.', keywords: 'player sprite character appearance custom zspr' },
    ],
  },
];

export default sections;
export { meta };
