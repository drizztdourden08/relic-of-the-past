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
