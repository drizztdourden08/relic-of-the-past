/* @layer renderer-components @kind component */
/** Per-key control renderer for the Display tab: aspect ratio, window, viewport, refresh rate. */
import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import type { SyncedRateStatus } from '@shared/types/display';
import { SegmentedControl } from '../../../../../design-system/primitives/SegmentedControl';
import { AspectRatioControl } from './AspectRatioControl';
import { RefreshRateControl } from './RefreshRateControl';

const VIEWPORT_OPTIONS = [
  { value: 'none', label: 'Letterbox' },
  { value: 'fit', label: 'Fit Window' },
  { value: 'fill', label: 'Stretch' },
];

const WINDOW_MODE_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'borderless', label: 'Borderless' },
];

const OFFSCREEN_AI_OPTIONS = [
  { value: 'idle', label: 'Idle' },
  { value: 'vanilla', label: 'Act normally' },
  { value: 'paused', label: 'Freeze' },
];

// Shown under the control for whichever option is selected, so each one explains itself rather than
// leaving the player to guess what "Idle" does to an enemy they can see but that is ignoring them.
const OFFSCREEN_AI_DESCRIPTIONS: Record<string, string> = {
  idle: 'Enemies in the extra width walk and animate normally, but will not chase, shoot or hurt you until they reach the original 4:3 screen. You can still hit them.',
  vanilla: 'Enemies behave fully everywhere, including chasing, shooting and hurting you from the extra width you can see but the original game could not. Matches the original game.',
  paused: 'Enemies in the extra width stop completely, mid-step, until they reach the original 4:3 screen. No movement, no animation, and no shadow.',
};

const ASPECT_DESCRIPTIONS: Record<string, string> = {
  auto: 'Matches the window size — adapts to notch, resize, and rotation automatically.',
  screen: 'Matches the full physical screen ratio.',
  wide: 'Choose a standard widescreen preset.',
  tall: 'Choose a tall (portrait-style) preset.',
  custom: 'Set an exact width : height ratio.',
};

interface DisplayControlsParams {
  key: string;
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  aspectOptions: Array<{ value: string; label: string }>;
  widePresets: Array<{ value: string; label: string }>;
  tallPresets?: Array<{ value: string; label: string }>;
  syncedRate: SyncedRateStatus;
  detectedHz: number | null;
}

const renderDisplayControl = (params: DisplayControlsParams): ReactNode | null => {
  const { key, settings, onChange, aspectOptions, widePresets, tallPresets, syncedRate, detectedHz } = params;

  if (key === 'aspectRatio') {
    return (
      <AspectRatioControl
        label="Aspect Ratio"
        description="Screen aspect ratio for the game content."
        value={settings.aspectRatio}
        options={aspectOptions}
        widePresets={widePresets}
        tallPresets={tallPresets}
        descriptions={ASPECT_DESCRIPTIONS}
        recommendedValue="auto"
        recommendedNote="Best for most setups — follows your window and adapts to notch or resize."
        customW={settings.customAspectW}
        customH={settings.customAspectH}
        ratioKey="aspectRatio"
        wKey="customAspectW"
        hKey="customAspectH"
        renderIntoNotch={settings.renderIntoNotch}
        onChange={onChange}
      />
    );
  }

  if (key === 'windowMode') {
    return (
      <SegmentedControl
        label="Window Mode"
        value={settings.windowMode}
        options={WINDOW_MODE_OPTIONS}
        onChange={(v) => onChange({ windowMode: v as GameSettings['windowMode'] })}
      />
    );
  }

  if (key === 'viewportConstraint') {
    return (
      <SegmentedControl
        label="Viewport"
        value={settings.viewportConstraint}
        options={VIEWPORT_OPTIONS}
        onChange={(v) => onChange({ viewportConstraint: v as GameSettings['viewportConstraint'] })}
      />
    );
  }

  if (key === 'offscreenAI') {
    return (
      <SegmentedControl
        label="Off-Screen AI"
        description={OFFSCREEN_AI_DESCRIPTIONS[settings.offscreenAI ?? 'idle']}
        value={settings.offscreenAI ?? 'idle'}
        options={OFFSCREEN_AI_OPTIONS}
        onChange={(v) => onChange({ offscreenAI: v as GameSettings['offscreenAI'] })}
      />
    );
  }

  if (key === 'syncedRefreshRateHz') {
    return (
      <RefreshRateControl
        status={syncedRate}
        detectedHz={detectedHz}
        value={settings.syncedRefreshRateHz}
        onChange={(hz) => onChange({ syncedRefreshRateHz: hz })}
      />
    );
  }

  return null;
};

export { renderDisplayControl };
export type { DisplayControlsParams };
