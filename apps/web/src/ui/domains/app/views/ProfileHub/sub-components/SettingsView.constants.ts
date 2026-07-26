/* @layer renderer-components @kind data */
import type { GameSettings } from '@shared/types/settings';
import type { Section, SettingItem } from '../../../compounds/SettingsLayout';

const PIXEL_PERFECT_ITEM: SettingItem = {
  key: 'pixelPerfect',
  label: 'Pixel Perfect',
  description: 'Scale the picture by whole source pixels only, so every pixel is exactly the same size. Removes the shimmer on fences, walls and other straight edges while scrolling, at the cost of slightly wider black borders. Turns Linear Filtering off while active.',
  keywords: 'pixel perfect integer scale scaling sharp crisp shimmer wobble ripple tearing nearest',
};

/** Pixel Perfect only has meaning under Letterbox — Fit/Stretch bypass the fit math entirely. */
const buildWindowSection = (s: GameSettings): Section => {
  const items: SettingItem[] = [
    { key: 'windowMode', label: 'Window Mode', description: 'Window display mode', keywords: 'borderless windowed default' },
    { key: 'startFullscreen', label: 'Start in Fullscreen', description: 'Automatically enter fullscreen when the game starts', keywords: 'fullscreen launch start' },
    { key: 'viewportConstraint', label: 'Viewport', description: 'Controls how the game canvas relates to the window', keywords: 'ratio lock constrain aspect black bars stretch fill fit viewport' },
  ];

  if (s.viewportConstraint === 'none') items.push(PIXEL_PERFECT_ITEM);

  return { id: 'window', title: 'Window', subsections: [{ id: 'window-mode', title: 'Mode', items }] };
};

const PERFORMANCE_SECTION: Section = {
  id: 'performance',
  title: 'Performance',
  subsections: [
    {
      id: 'performance-options',
      title: 'Options',
      items: [
        { key: 'displayPerfInTitle', label: 'Show FPS', description: 'Display the current frames per second in the title bar while the game is running', keywords: 'fps performance frame rate counter' },
        { key: 'vsync', label: 'V-Sync', description: 'Pace the game against your display’s refresh rate instead of an internal timer. Smooths scrolling on 60 Hz displays where the two clocks would otherwise drift apart. Game speed stays correct on any refresh rate.', keywords: 'vsync v-sync tearing judder stutter frame pacing refresh rate smooth scrolling 60hz' },
      ],
    },
  ],
};

const RENDERING_SECTION: Section = {
  id: 'rendering',
  title: 'Rendering',
  subsections: [
    {
      id: 'rendering-engine',
      title: 'Engine',
      items: [
        { key: 'newRenderer', label: 'Optimized PPU', description: 'Use a faster, rewritten pixel processing unit instead of the cycle-accurate SNES PPU — visually identical but significantly faster', keywords: 'ppu renderer engine optimized fast' },
        { key: 'enhancedMode7', label: 'Enhanced Mode 7', description: 'Render the world map and flying sequences at higher resolution with smooth rotation and scaling, replacing the original pixelated Mode 7 effect', keywords: 'mode7 map resolution hd smooth' },
        { key: 'noSpriteLimits', label: 'No Sprite Limit', description: 'Remove the original SNES limitation of 8 sprites per scanline — eliminates sprite flickering in busy scenes', keywords: 'sprite limit scanline flicker' },
      ],
    },
    {
      id: 'rendering-quality',
      title: 'Quality',
      items: [
        { key: 'linearFiltering', label: 'Linear Filtering', description: 'Apply bilinear interpolation for smoother, less pixelated visuals — disable for crisp pixel art', keywords: 'filter smooth pixel crisp bilinear' },
        { key: 'dimFlashes', label: 'Dim Flashes', description: 'Reduce the intensity of screen flashing effects (lightning, boss hits) similar to Virtual Console — helps with photosensitivity', keywords: 'flash dim reduce epilepsy accessibility' },
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
        // Shadow Casting (postProcessingShadows) is intentionally not exposed yet — the subsystem is WIP.
      ],
    },
    {
      id: 'enhancements-indoor',
      title: 'Indoor / Dungeons',
      items: [
        { key: 'forceBackdropBlack', label: 'Black Background', description: 'Replace the colored backdrop behind rooms with pure black', keywords: 'backdrop background color indoor dungeon house black' },
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
  title: 'Mobile',
  subsections: [{ id: 'mobile-display', title: 'Display', items: [NOTCH_ITEM] }],
};

export { buildWindowSection, PERFORMANCE_SECTION, RENDERING_SECTION, ENHANCEMENTS_SECTION, MOBILE_SECTION };
