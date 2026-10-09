/* @layer renderer-widgets @kind component */
import { SegmentedControl } from '@drizztdourden08/tessera/primitives';
import { ControlMenuRow } from '@drizztdourden08/tessera/composites';
import { useWidgetPref } from '@drizztdourden08/brock-react';
import { useNavigationOverlayStore } from '@app/stores/navigation-overlay-store';
import type { NavMode } from '@app/stores/navigation-overlay-store';
import { MODE_OPTIONS } from './FunctionsPanel.constants';
import { MODE_HINT } from './NavigationWidgetSettings.constants';

const NavigationWidgetSettings = () => {
  const mode = useNavigationOverlayStore((s) => s.mode);
  const setStoreMode = useNavigationOverlayStore((s) => s.setMode);
  const [, setSavedMode] = useWidgetPref<NavMode>('navigation', 'mode', 'manual');

  const handleChange = (next: NavMode) => {
    setStoreMode(next);
    setSavedMode(next);
  };

  return (
    <ControlMenuRow label="Mode" hint={MODE_HINT}>
      <SegmentedControl<NavMode> value={mode} options={MODE_OPTIONS} onChange={handleChange} />
    </ControlMenuRow>
  );
};

export { NavigationWidgetSettings };
