/* @layer renderer-components @kind component */
/** System tab — app/host meta: window, performance, and save-state management. */
import { type ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { SettingsLayout, type Section } from '../../../compounds/SettingsLayout';
import { SegmentedControl } from '../../../../../design-system/primitives/SegmentedControl';
import { buildWindowSection, buildPerformanceSection } from './SettingsView.constants';
import { useRefreshRate } from '../../../../../../hooks/useRefreshRate';
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
// Performance copy carries a refresh-rate note that depends on the display we detect.
const buildSections = (s: GameSettings, refreshHz: number | null): Section[] =>
  [buildWindowSection(s), buildPerformanceSection(refreshHz), SAVE_SECTION];

const renderControl = (key: string, settings: GameSettings, onChange: (patch: Partial<GameSettings>) => void): ReactNode | null => {
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
  return (
    <SettingsLayout
      sections={buildSections(settings, refreshHz)}
      settings={settings}
      onChange={onChange}
      renderControl={renderControl}
      isDisabled={isDisabled}
    />
  );
};

export { SystemSettings };
