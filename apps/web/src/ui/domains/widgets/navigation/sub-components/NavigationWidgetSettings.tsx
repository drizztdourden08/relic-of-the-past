/* @layer renderer-widgets @kind component */
/**
 * The navigation widget's own options: manual or auto flooding. The overlay
 * store is the live value and the widget pref is the copy that survives the app
 * closing, so a change here writes both, the same way useNavigation's setMode does.
 */
import { SegmentedControl } from '@ds/primitives';
import { OptionRow } from '@ds/composites/Widget';
import { useWidgetPref } from '@app/hooks/useWidgetPref';
import { useNavigationOverlayStore } from '@app/stores/navigation-overlay-store';
import type { NavMode } from '@app/stores/navigation-overlay-store';
import { MODE_OPTIONS } from './FunctionsPanel.constants';

const NavigationWidgetSettings = () => {
  const mode = useNavigationOverlayStore((s) => s.mode);
  const setStoreMode = useNavigationOverlayStore((s) => s.setMode);
  const [, setSavedMode] = useWidgetPref<NavMode>('navigation', 'mode', 'manual');

  const handleChange = (next: NavMode) => {
    setStoreMode(next);
    setSavedMode(next);
  };

  return (
    <OptionRow label="Mode" hint="Auto floods on every screen change">
      <SegmentedControl<NavMode> value={mode} options={MODE_OPTIONS} onChange={handleChange} />
    </OptionRow>
  );
};

export { NavigationWidgetSettings };
