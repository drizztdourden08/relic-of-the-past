import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { SegmentedControl } from '../../../primitives/SegmentedControl';
import { SettingsLayout, type Section } from '../../../composites/SettingsLayout';

interface SettingsViewProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

const SECTIONS: Section[] = [
  {
    id: 'display',
    title: 'Display',
    subsections: [
      {
        id: 'display-aspect',
        title: 'Aspect Ratio',
        items: [
          { key: 'aspectRatio', label: 'Aspect Ratio', description: 'Screen aspect ratio for the game content', keywords: 'widescreen 4:3 16:9 16:10 18:9 ultrawide' },
          { key: 'extendY', label: 'Extend Y', description: 'Show 240 lines instead of 224, revealing extra vertical content at the top and bottom of the screen', keywords: 'height resolution vertical' },
        ],
      },
      {
        id: 'display-widescreen',
        title: 'Widescreen',
        items: [
          { key: 'unchangedSprites', label: 'Unchanged Sprites', description: 'Keep original sprite behavior — sprites won\'t spawn or despawn earlier in widescreen mode', keywords: 'sprites widescreen' },
          { key: 'noVisualFixes', label: 'No Visual Fixes', description: 'Skip widescreen graphics corrections — some tiles may render incorrectly at the edges', keywords: 'visual fixes widescreen' },
        ],
      },
    ],
  },
  {
    id: 'window',
    title: 'Window',
    subsections: [
      {
        id: 'window-mode',
        title: 'Mode',
        items: [
          { key: 'windowMode', label: 'Window Mode', description: 'Window display mode', keywords: 'borderless windowed default' },
          { key: 'startFullscreen', label: 'Start in Fullscreen', description: 'Automatically enter fullscreen when the game starts', keywords: 'fullscreen launch start' },
          { key: 'viewportConstraint', label: 'Viewport', description: 'Controls how the game canvas relates to the window', keywords: 'ratio lock constrain aspect black bars stretch fill fit viewport' },
        ],
      },
    ],
  },
  {
    id: 'performance',
    title: 'Performance',
    subsections: [
      {
        id: 'performance-options',
        title: 'Options',
        items: [
          { key: 'displayPerfInTitle', label: 'Show FPS', description: 'Display the current frames per second in the title bar while the game is running', keywords: 'fps performance frame rate counter' },
          { key: 'disableFrameDelay', label: 'Disable Frame Delay', description: 'Remove the per-frame sleep used for timing — improves performance and reduces input lag on 60 Hz displays where V-Sync handles the pacing', keywords: 'frame delay vsync performance input lag 60hz' },
        ],
      },
    ],
  },
  {
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
          { key: 'postProcessingShadows', label: 'Shadow Casting', description: 'Heightmap-based dynamic shadows and lighting overlay on the overworld', keywords: 'shadow lighting heightmap dynamic sun' },
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
  },
];

const ASPECT_OPTIONS = [
  { value: '4:3', label: '4:3' },
  { value: '3:2', label: '3:2' },
  { value: '16:9', label: '16:9' },
  { value: '16:10', label: '16:10' },
  { value: '18:9', label: '18:9' },
];

const VIEWPORT_OPTIONS = [
  { value: 'none', label: 'Letterbox' },
  { value: 'fit', label: 'Fit Window' },
  { value: 'fill', label: 'Stretch' },
];

const WINDOW_MODE_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'borderless', label: 'Borderless' },
];

const renderControl = (key: string, settings: GameSettings, onChange: (patch: Partial<GameSettings>) => void): ReactNode | null => {
  switch (key) {
    case 'aspectRatio':
      return (
        <SegmentedControl
          label="Aspect Ratio"
          value={settings.aspectRatio}
          options={ASPECT_OPTIONS}
          onChange={(v) => onChange({ aspectRatio: v as GameSettings['aspectRatio'] })}
        />
      );
    case 'viewportConstraint':
      return (
        <SegmentedControl
          label="Viewport"
          value={settings.viewportConstraint}
          options={VIEWPORT_OPTIONS}
          onChange={(v) => onChange({ viewportConstraint: v as GameSettings['viewportConstraint'] })}
        />
      );
    case 'windowMode':
      return (
        <SegmentedControl
          label="Window Mode"
          value={settings.windowMode}
          options={WINDOW_MODE_OPTIONS}
          onChange={(v) => onChange({ windowMode: v as GameSettings['windowMode'] })}
        />
      );
    default:
      return null;
  }
};

const SettingsView = (props: SettingsViewProps) => {
  const { settings, onChange } = props;

  return (
    <SettingsLayout
      sections={SECTIONS}
      settings={settings}
      onChange={onChange}
      renderControl={renderControl}
    />
  );
};

export { SettingsView };
export type { SettingsViewProps };
