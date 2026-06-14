/* @layer renderer-components @kind component */
/** Per-key control renderer + option config for the HUD settings tab. */
import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { SegmentedControl } from '../../../../../design-system/primitives/SegmentedControl';
import { ToggleGroup } from '../../../../../design-system/primitives/ToggleGroup';
import { HudStyleControl } from './HudStyleControl';

const HUD_MODE_OPTIONS = [
  { value: 'original', label: 'Original' },
  { value: 'enhanced', label: 'Enhanced' },
];

const ASPECT_OPTIONS = [
  { value: '4:3', label: '4:3' },
  { value: '3:2', label: '3:2' },
  { value: '16:9', label: '16:9' },
  { value: '16:10', label: '16:10' },
  { value: '18:9', label: '18:9' },
];

const ratioToNum = (r: string): number => {
  const [w, h] = r.split(':').map(Number);
  return w / h;
};

const getHudRatioOptions = (screenRatio: GameSettings['aspectRatio']) => {
  const screenVal = ratioToNum(screenRatio);
  return [
    { value: 'match' as const, label: 'Match' },
    ...ASPECT_OPTIONS.map((opt) => ({
      ...opt,
      disabled: ratioToNum(opt.value) > screenVal,
    })),
  ];
};

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

const renderControl = (key: string, settings: GameSettings, onChange: (patch: Partial<GameSettings>) => void): ReactNode | null => {
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
        <HudStyleControl
          value={settings.hudStyle}
          onChange={(v) => onChange({ hudStyle: v })}
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
};

export { renderControl };
