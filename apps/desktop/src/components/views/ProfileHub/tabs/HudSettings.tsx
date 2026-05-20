import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { SettingsLayout, type Section } from '../../../composites/SettingsLayout';
import { SegmentedControl } from '../../../primitives/SegmentedControl';
import { ToggleGroup } from '../../../primitives/ToggleGroup';

interface HudSettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

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

const HUD_MODE_OPTIONS = [
  { value: 'original', label: 'Original' },
  { value: 'enhanced', label: 'Enhanced' },
];

const HUD_STYLE_OPTIONS = [
  { value: 'vanilla', label: 'Vanilla' },
  { value: 'modern', label: 'Modern', disabled: true },
];

const ASPECT_OPTIONS = [
  { value: '4:3', label: '4:3' },
  { value: '3:2', label: '3:2' },
  { value: '16:9', label: '16:9' },
  { value: '16:10', label: '16:10' },
  { value: '18:9', label: '18:9' },
];

/** Convert ratio string to numeric value for comparison */
function ratioToNum(r: string): number {
  const [w, h] = r.split(':').map(Number);
  return w / h;
}

function getHudRatioOptions(screenRatio: GameSettings['aspectRatio']) {
  const screenVal = ratioToNum(screenRatio);
  return [
    { value: 'match' as const, label: 'Match' },
    ...ASPECT_OPTIONS.map((opt) => ({
      ...opt,
      disabled: ratioToNum(opt.value) > screenVal,
    })),
  ];
}

const HEART_OPTIONS = [
  { value: 'original', label: 'Original' },
  { value: 'smooth', label: 'Smooth' },
];

const MAGIC_OPTIONS = [
  { value: 'original', label: 'Original' },
  { value: 'accurate', label: 'Accurate' },
];

const COUNT_LAYOUT_OPTIONS = [
  { value: 'centered', label: 'Centered' },
  { value: 'original', label: 'Original' },
];

const ENHANCED_PARTS_OPTIONS = [
  { value: 'main', label: 'Main' },
  { value: 'pause', label: 'Pause' },
];

const PAUSE_HIGHLIGHT_OPTIONS = [
  { value: 'box', label: 'Box' },
  { value: 'glow', label: 'Glow' },
  { value: 'none', label: 'None' },
];

function renderControl(key: string, settings: GameSettings, onChange: (patch: Partial<GameSettings>) => void): ReactNode | null {
  switch (key) {
    case 'hudMode':
      return (
        <SegmentedControl
          label="HUD Mode"
          description="Original renders directly on the game canvas. Enhanced draws a separate overlay with improved visuals and widescreen support."
          value={settings.hudMode}
          options={HUD_MODE_OPTIONS}
          onChange={(v) => onChange({ hudMode: v as GameSettings['hudMode'] })}
        />
      );
    case 'hudStyle':
      return (
        <SegmentedControl
          label="Style"
          description="Vanilla recreates the original SNES look using extracted sprites. Modern uses a redesigned theme."
          value={settings.hudStyle}
          options={HUD_STYLE_OPTIONS}
          onChange={(v) => onChange({ hudStyle: v as GameSettings['hudStyle'] })}
        />
      );
    case 'hudRatio':
      return (
        <SegmentedControl
          label="Aspect Ratio"
          description="Match keeps the overlay in sync with the game viewport. Fixed ratios let you pin the HUD to a narrower area."
          value={settings.hudRatio}
          options={getHudRatioOptions(settings.aspectRatio)}
          onChange={(v) => onChange({ hudRatio: v as GameSettings['hudRatio'] })}
        />
      );
    case 'hudEnhancedParts':
      return (
        <ToggleGroup
          label="Enhanced Parts"
          description="Select which parts the enhanced overlay replaces. Unselected parts keep using the original game rendering."
          value={settings.hudEnhancedParts as string[]}
          options={ENHANCED_PARTS_OPTIONS}
          onChange={(v) => onChange({ hudEnhancedParts: v as GameSettings['hudEnhancedParts'] })}
        />
      );
    case 'hudHeartMode':
      return (
        <SegmentedControl
          label="Heart Style"
          description="Original fills hearts in 4 steps like the SNES. Smooth fills them gradually for a more precise health readout."
          value={settings.hudHeartMode}
          options={HEART_OPTIONS}
          onChange={(v) => onChange({ hudHeartMode: v as GameSettings['hudHeartMode'] })}
        />
      );
    case 'hudMagicMode':
      return (
        <SegmentedControl
          label="Magic Meter"
          description="Original rounds the bar to 1/8ths. Accurate shows the true internal value for pixel-perfect depletion."
          value={settings.hudMagicMode}
          options={MAGIC_OPTIONS}
          onChange={(v) => onChange({ hudMagicMode: v as GameSettings['hudMagicMode'] })}
        />
      );
    case 'hudCountLayout':
      return (
        <SegmentedControl
          label="Counter Layout"
          description="Centered places counters in the middle of the HUD bar. Original matches the SNES left-aligned positions."
          value={settings.hudCountLayout}
          options={COUNT_LAYOUT_OPTIONS}
          onChange={(v) => onChange({ hudCountLayout: v as GameSettings['hudCountLayout'] })}
        />
      );
    case 'hudPauseHighlight':
      return (
        <SegmentedControl
          label="Item Highlight"
          description="How the selected item cursor appears. Box draws a border. Glow adds a pulsing highlight. None hides it."
          value={settings.hudPauseHighlight}
          options={PAUSE_HIGHLIGHT_OPTIONS}
          onChange={(v) => onChange({ hudPauseHighlight: v as GameSettings['hudPauseHighlight'] })}
        />
      );
    default:
      return null;
  }
}

const HudSettings = ({ settings, onChange }: HudSettingsProps) => {
  return (
    <SettingsLayout
      sections={SECTIONS}
      settings={settings}
      onChange={onChange}
      renderControl={renderControl}
    />
  );
};

export { HudSettings };
