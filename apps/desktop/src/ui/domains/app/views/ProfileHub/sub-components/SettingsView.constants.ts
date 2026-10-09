/* @layer renderer-components @kind constants */
import type { Section, SettingItem } from '../../../compounds/SettingsLayout';

const PIXEL_PERFECT_ITEM: SettingItem = {
  key: 'pixelPerfect',
  label: 'Pixel Perfect',
  description: 'Scale the picture by whole source pixels only, so every pixel is exactly the same size. Removes the shimmer on fences, walls and other straight edges while scrolling, at the cost of slightly wider black borders. Turns Linear Filtering off while active.',
  keywords: 'pixel perfect integer scale scaling sharp crisp shimmer wobble ripple tearing nearest',
};

const VSYNC_DESCRIPTION = 'Pace the game against the refresh rate of your display instead of an internal timer. Smooths scrolling on 60 Hz displays where the two clocks would otherwise drift apart. Game speed stays correct on any refresh rate.';

const SYNCED_RATE_KEYWORDS = 'refresh rate hz synced sync fullscreen full screen display mode monitor 60 120 144 multiple judder stutter';

const RENDERING_SECTION: Section = {
  id: 'rendering',
  title: 'Rendering',
  subsections: [
    {
      id: 'rendering-engine',
      title: 'Engine',
      items: [
        { key: 'newRenderer', label: 'Optimized PPU', description: 'Use a faster, rewritten pixel processing unit instead of the cycle-accurate SNES PPU. Looks identical and runs much faster', keywords: 'ppu renderer engine optimized fast' },
        { key: 'enhancedMode7', label: 'Enhanced Mode 7', description: 'Render the world map and flying sequences at higher resolution with smooth rotation and scaling, replacing the original pixelated Mode 7 effect', keywords: 'mode7 map resolution hd smooth' },
        { key: 'noSpriteLimits', label: 'No Sprite Limit', description: 'Remove the original SNES limitation of 8 sprites per scanline, so busy scenes stop flickering', keywords: 'sprite limit scanline flicker' },
      ],
    },
    {
      id: 'rendering-quality',
      title: 'Quality',
      items: [
        { key: 'linearFiltering', label: 'Linear Filtering', description: 'Apply bilinear interpolation for smoother, less pixelated visuals. Turn it off for crisp pixel art', keywords: 'filter smooth pixel crisp bilinear' },
        { key: 'dimFlashes', label: 'Dim Flashes', description: 'Reduce the intensity of screen flashing effects (lightning, boss hits) similar to Virtual Console. Helps with photosensitivity', keywords: 'flash dim reduce epilepsy accessibility' },
      ],
    },
  ],
};

const ENHANCEMENTS_SECTION: Section = {
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
};

const NOTCH_ITEM = {
  key: 'renderIntoNotch',
  label: 'Render under camera cutout',
  description: 'On: the game and UI use the full screen, extending under the camera notch. Off: keep everything inside the usable screen area.',
  keywords: 'notch cutout camera safe area fullscreen mobile display edge',
};

const MOBILE_SECTION: Section = {
  id: 'mobile',
  title: 'Display',
  items: [NOTCH_ITEM],
};

const EXTENDED_TOGGLE: SettingItem = {
  key: 'extendedRendering',
  label: 'Extended Rendering',
  description: 'Enables widescreen, tall, and camera enhancements. Off = fixed 4:3 vanilla.',
  keywords: 'widescreen wide tall ultrawide extended aspect ratio ppu resolution vanilla',
};

const MOBILE_SECTIONS: Section[] = [MOBILE_SECTION];

const CAMERA_OFF_MESSAGE = 'Camera options appear once Extended Rendering is on, in Display.';

const REQUIRES_LINEAR = new Set(['21:9']);
const REQUIRES_ULTRAWIDE = new Set(['32:9']);
const TALL_PRESET_VALUES = new Set(['4:5', '3:4']);

const TALL_PRESETS = [
  { value: '4:5', label: '4:5' },
  { value: '3:4', label: '3:4' },
];

export {
  CAMERA_OFF_MESSAGE, ENHANCEMENTS_SECTION, EXTENDED_TOGGLE, MOBILE_SECTION, MOBILE_SECTIONS, PIXEL_PERFECT_ITEM, RENDERING_SECTION,
  REQUIRES_LINEAR, REQUIRES_ULTRAWIDE, SYNCED_RATE_KEYWORDS, TALL_PRESETS, TALL_PRESET_VALUES,
  VSYNC_DESCRIPTION,
};
