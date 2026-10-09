/* @layer renderer-components @kind logic */
import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { SegmentedControl } from '@drizztdourden08/tessera/primitives';
import { AspectRatioControl } from './AspectRatioControl';
import { RefreshRateControl } from './RefreshRateControl';
import {
  ASPECT_DESCRIPTIONS, OFFSCREEN_BEHAVIOUR_DESCRIPTIONS, OFFSCREEN_BEHAVIOUR_OPTIONS,
  VIEWPORT_OPTIONS, WINDOW_MODE_OPTIONS,
} from './SettingsView.controls.constants';
import type { DisplayControlsParams } from './SettingsView.type';

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
        recommendedNote="Best for most setups. Follows your window and adapts to notch or resize."
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
        description={OFFSCREEN_BEHAVIOUR_DESCRIPTIONS[settings.offscreenAI ?? 'idle']}
        value={settings.offscreenAI ?? 'idle'}
        options={OFFSCREEN_BEHAVIOUR_OPTIONS}
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
