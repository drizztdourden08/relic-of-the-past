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
        id: 'hud-mode',
        title: 'HUD Mode',
        items: [
          { key: 'hudMode', label: 'HUD Mode', description: 'Original uses the game canvas HUD. Enhanced renders a separate overlay HUD.', keywords: 'hud mode original enhanced overlay' },
        ],
      },
      {
        id: 'hud-style',
        title: 'Style',
        items: [
          { key: 'hudStyle', label: 'Style', description: 'Visual theme for the HUD overlay', keywords: 'hud style vanilla modern theme' },
        ],
      },
      {
        id: 'hud-ratio',
        title: 'Ratio',
        items: [
          { key: 'hudRatio', label: 'Ratio', description: 'Aspect ratio for the HUD overlay. Match uses the current screen ratio.', keywords: 'hud ratio aspect match' },
        ],
      },
      {
        id: 'hud-enhanced-parts',
        title: 'Enhanced Parts',
        items: [
          { key: 'hudEnhancedParts', label: 'Enhanced Parts', description: 'Select which HUD parts to replace with the enhanced overlay', keywords: 'hud parts main pause enhanced' },
        ],
      },
    ],
  },
  {
    id: 'hud-elements',
    title: 'Elements',
    subsections: [
      {
        id: 'hearts-style',
        title: 'Hearts',
        items: [
          { key: 'hudHeartMode', label: 'Heart Style', description: 'Visual style for the life hearts display', keywords: 'heart life health style' },
        ],
      },
      {
        id: 'magic-style',
        title: 'Magic Meter',
        items: [
          { key: 'hudMagicMode', label: 'Magic Meter Style', description: 'Visual style for the magic power meter', keywords: 'magic meter style bar' },
        ],
      },
      {
        id: 'layout-counts',
        title: 'Counters',
        items: [
          { key: 'hudCountLayout', label: 'Counter Position', description: 'Where to place the rupee, bomb, arrow, and key counters', keywords: 'counter layout position center original rupee bomb arrow key' },
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
  { value: 'pause', label: 'Pause', disabled: true },
];

function renderControl(key: string, settings: GameSettings, onChange: (patch: Partial<GameSettings>) => void): ReactNode | null {
  switch (key) {
    case 'hudMode':
      return (
        <SegmentedControl
          label="HUD Mode"
          value={settings.hudMode}
          options={HUD_MODE_OPTIONS}
          onChange={(v) => onChange({ hudMode: v as GameSettings['hudMode'] })}
        />
      );
    case 'hudStyle':
      return (
        <SegmentedControl
          label="Style"
          value={settings.hudStyle}
          options={HUD_STYLE_OPTIONS}
          onChange={(v) => onChange({ hudStyle: v as GameSettings['hudStyle'] })}
        />
      );
    case 'hudRatio':
      return (
        <SegmentedControl
          label="Ratio"
          value={settings.hudRatio}
          options={getHudRatioOptions(settings.aspectRatio)}
          onChange={(v) => onChange({ hudRatio: v as GameSettings['hudRatio'] })}
        />
      );
    case 'hudEnhancedParts':
      return (
        <ToggleGroup
          label="Enhanced Parts"
          value={settings.hudEnhancedParts as string[]}
          options={ENHANCED_PARTS_OPTIONS}
          onChange={(v) => onChange({ hudEnhancedParts: v as GameSettings['hudEnhancedParts'] })}
        />
      );
    case 'hudHeartMode':
      return (
        <SegmentedControl
          label="Heart Style"
          value={settings.hudHeartMode}
          options={HEART_OPTIONS}
          onChange={(v) => onChange({ hudHeartMode: v as GameSettings['hudHeartMode'] })}
        />
      );
    case 'hudMagicMode':
      return (
        <SegmentedControl
          label="Magic Meter Style"
          value={settings.hudMagicMode}
          options={MAGIC_OPTIONS}
          onChange={(v) => onChange({ hudMagicMode: v as GameSettings['hudMagicMode'] })}
        />
      );
    case 'hudCountLayout':
      return (
        <SegmentedControl
          label="Counter Position"
          value={settings.hudCountLayout}
          options={COUNT_LAYOUT_OPTIONS}
          onChange={(v) => onChange({ hudCountLayout: v as GameSettings['hudCountLayout'] })}
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
