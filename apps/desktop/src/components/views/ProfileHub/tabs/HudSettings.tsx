import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { SettingsLayout, type Section } from '../../../composites/SettingsLayout';
import { SegmentedControl } from '../../../primitives/SegmentedControl';

interface HudSettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

const SECTIONS: Section[] = [
  {
    id: 'hearts',
    title: 'Hearts',
    subsections: [
      {
        id: 'hearts-style',
        title: 'Style',
        items: [
          { key: 'hudHeartMode', label: 'Heart Style', description: 'Visual style for the life hearts display', keywords: 'heart life health style' },
        ],
      },
    ],
  },
  {
    id: 'magic',
    title: 'Magic Meter',
    subsections: [
      {
        id: 'magic-style',
        title: 'Style',
        items: [
          { key: 'hudMagicMode', label: 'Magic Meter Style', description: 'Visual style for the magic power meter', keywords: 'magic meter style bar' },
        ],
      },
    ],
  },
  {
    id: 'layout',
    title: 'Layout',
    subsections: [
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

function renderControl(key: string, settings: GameSettings, onChange: (patch: Partial<GameSettings>) => void): ReactNode | null {
  switch (key) {
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
