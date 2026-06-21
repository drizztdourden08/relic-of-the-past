/* @layer renderer-components @kind component */
/** System tab — app/host meta: window, performance, and save-state management. */
import { type ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { SettingsLayout, type Section } from '../../../compounds/SettingsLayout';
import { SegmentedControl } from '../../../../../design-system/primitives/SegmentedControl';
import { WINDOW_SECTION, PERFORMANCE_SECTION } from './SettingsView.constants';
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

const SECTIONS: Section[] = [WINDOW_SECTION, PERFORMANCE_SECTION, SAVE_SECTION];

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
  return (
    <SettingsLayout
      sections={SECTIONS}
      settings={settings}
      onChange={onChange}
      renderControl={renderControl}
      isDisabled={isDisabled}
    />
  );
};

export { SystemSettings };
