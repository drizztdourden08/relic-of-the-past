/* @layer renderer-components @kind component */
/** System tab — app/host meta: window, performance, and save-state management. */
import { useCallback, type ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import type { SyncedRateStatus } from '@shared/types/display';
import { SettingsLayout, type Section } from '../../../compounds/SettingsLayout';
import { SegmentedControl } from '../../../../../design-system/primitives/SegmentedControl';
import { buildWindowSection, buildPerformanceSection } from './SettingsView.constants';
import { useRefreshRate } from '../../../../../../hooks/useRefreshRate';
import { useSyncedRate } from '../../../../../../hooks/useSyncedRate';
import { effectiveHz } from '@shared/display/refresh-rate';
import { SAVE_SECTION } from './gameplay-settings-sections';
import { renderControl as renderSaveControl, isDisabled } from './gameplay-settings-controls';

interface SystemSettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

const VIEWPORT_OPTIONS = [
  { value: 'none', label: 'Letterbox' },
  { value: 'fit', label: 'Fit Window' },
  { value: 'fill', label: 'Stretch' },
];

const WINDOW_MODE_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'borderless', label: 'Borderless' },
];

// Both built per-render: Pixel Perfect only appears under the Letterbox viewport, and the
// Performance copy depends on the display we detect and on what the host can switch to.
const buildSections = (s: GameSettings, refreshHz: number | null, syncedRate: SyncedRateStatus): Section[] =>
  [buildWindowSection(s), buildPerformanceSection(refreshHz, syncedRate), SAVE_SECTION];

/** Options come from the rates the display actually reported, so none of them can be refused. */
const rateOptions = (rates: number[]): Array<{ value: string; label: string }> =>
  rates.map((hz) => ({ value: String(hz), label: `${hz} Hz` }));

const renderControl = (key: string, settings: GameSettings, onChange: (patch: Partial<GameSettings>) => void, syncedRate?: SyncedRateStatus): ReactNode | null => {
  if (key === 'syncedRefreshRateHz' && syncedRate) {
    // A stored rate the display no longer offers would leave the control with no selection, so
    // fall back to showing the highest — which is what 0 (the default) resolves to anyway.
    const rates = syncedRate.availableRates;
    const stored = settings.syncedRefreshRateHz;
    const selected = stored > 0 && rates.includes(stored) ? stored : rates[rates.length - 1];
    return (
      <SegmentedControl
        label="Target Refresh Rate"
        value={String(selected)}
        options={rateOptions(rates)}
        onChange={(v) => onChange({ syncedRefreshRateHz: Number(v) })}
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
  // Save-state controls (sliders/steppers) are rendered by the shared gameplay renderer.
  return renderSaveControl(key, settings, onChange);
};

const SystemSettings = (props: SystemSettingsProps) => {
  const { settings, onChange } = props;
  const refreshHz = effectiveHz(useRefreshRate());
  // Pushing the preference here also arms it for the session — the host applies it on the next
  // fullscreen transition, not on this call.
  const { status: syncedRate } = useSyncedRate(settings.syncedRefreshRate, settings.syncedRefreshRateHz);
  const renderWithStatus = useCallback(
    (key: string, s: GameSettings, change: (patch: Partial<GameSettings>) => void) => renderControl(key, s, change, syncedRate),
    [syncedRate],
  );
  return (
    <SettingsLayout
      sections={buildSections(settings, refreshHz, syncedRate)}
      settings={settings}
      onChange={onChange}
      renderControl={renderWithStatus}
      isDisabled={isDisabled}
    />
  );
};

export { SystemSettings };
