/* @layer renderer-components @kind data */
import { useMemo, type ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { SegmentedControl } from '../../../../../design-system/primitives/SegmentedControl';
import { SettingsLayout, type Section } from '../../../compounds/SettingsLayout';
import { AspectRatioControl } from './AspectRatioControl';
import { usePlatform } from '@app/platform';
import { useSafeAreaInsets } from '@app/hooks/useSafeAreaInsets';

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
          { key: 'aspectRatio', label: 'Aspect Ratio', description: 'Screen aspect ratio for the game content. Auto re-detects your screen on every start.', keywords: 'widescreen 4:3 16:9 16:10 custom auto detect ultrawide 21:9' },
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
  { value: 'auto', label: 'Auto' },
  { value: 'screen', label: 'Screen' },
  { value: 'preset', label: 'Preset' },
  { value: 'custom', label: 'Custom' },
];

const ASPECT_PRESETS = [
  { value: '4:3', label: '4:3' },
  { value: '3:2', label: '3:2' },
  { value: '16:9', label: '16:9' },
  { value: '16:10', label: '16:10' },
];

const ASPECT_DESCRIPTIONS: Record<string, string> = {
  auto: 'Matches the app’s current size and adapts as it changes (e.g. around a camera cutout). Best default.',
  screen: 'Matches your device’s full physical screen ratio.',
  preset: 'Use a fixed, standard aspect ratio.',
  custom: 'Set an exact width : height ratio.',
};

const VIEWPORT_OPTIONS = [
  { value: 'none', label: 'Letterbox' },
  { value: 'fit', label: 'Fit Window' },
  { value: 'fill', label: 'Stretch' },
];

const WINDOW_MODE_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'borderless', label: 'Borderless' },
];

// Mobile-only, shown only when the device actually has a cutout (see SettingsView).
const NOTCH_ITEM = {
  key: 'renderIntoNotch',
  label: 'Render under camera cutout',
  description: 'On: the game and UI use the full screen, extending under the camera notch. Off: keep everything inside the usable screen area.',
  keywords: 'notch cutout camera safe area fullscreen mobile display edge',
};

const renderControl = (key: string, settings: GameSettings, onChange: (patch: Partial<GameSettings>) => void): ReactNode | null => {
  switch (key) {
    case 'aspectRatio':
      return (
        <AspectRatioControl
          label="Aspect Ratio"
          description="Screen aspect ratio for the game content."
          value={settings.aspectRatio}
          options={ASPECT_OPTIONS}
          presetOptions={ASPECT_PRESETS}
          descriptions={ASPECT_DESCRIPTIONS}
          customW={settings.customAspectW}
          customH={settings.customAspectH}
          ratioKey="aspectRatio"
          wKey="customAspectW"
          hKey="customAspectH"
          renderIntoNotch={settings.renderIntoNotch}
          onChange={onChange}
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
  const { info } = usePlatform();
  const { hasNotch } = useSafeAreaInsets();
  const showNotch = info.formFactor === 'mobile' && hasNotch;

  // Inject the notch toggle into the Window section only on a mobile device with a cutout.
  const sections = useMemo<Section[]>(() => {
    if (!showNotch) return SECTIONS;
    return SECTIONS.map((section) =>
      section.id === 'window'
        ? { ...section, subsections: [...section.subsections, { id: 'window-notch', title: 'Mobile', items: [NOTCH_ITEM] }] }
        : section,
    );
  }, [showNotch]);

  return (
    <SettingsLayout
      sections={sections}
      settings={settings}
      onChange={onChange}
      renderControl={renderControl}
    />
  );
};

export { SettingsView };
export type { SettingsViewProps };
