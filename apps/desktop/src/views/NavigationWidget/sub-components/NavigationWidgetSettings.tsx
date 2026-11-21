/* @layer renderer-widgets @kind component */
import { SegmentedControl } from '@drizztdourden08/tessera/primitives';
import { ControlMenuRow } from '@drizztdourden08/tessera/composites';
import { useT, useWidgetPref } from '@drizztdourden08/brock-react';
import { useNavigationOverlayStore } from '@app/stores/navigation-overlay-store';
import type { NavMode } from '@app/stores/navigation-overlay-store';
import { modeOptions } from './FunctionsPanel.constants';
import { modeHint } from './NavigationWidgetSettings.constants';

const NavigationWidgetSettings = () => {
  const t = useT();
  const mode = useNavigationOverlayStore((s) => s.mode);
  const setStoreMode = useNavigationOverlayStore((s) => s.setMode);
  const [, setSavedMode] = useWidgetPref<NavMode>('navigation', 'mode', 'manual');

  const handleChange = (next: NavMode) => {
    setStoreMode(next);
    setSavedMode(next);
  };

  return (
    <ControlMenuRow label={t('views-navigation:settings.mode.label')} hint={modeHint(t)}>
      <SegmentedControl<NavMode> value={mode} options={modeOptions(t)} onChange={handleChange} />
    </ControlMenuRow>
  );
};

export { NavigationWidgetSettings };
