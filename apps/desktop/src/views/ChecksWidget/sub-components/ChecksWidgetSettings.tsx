/* @layer renderer-widgets @kind component */
import { SegmentedControl, Toggle } from '@drizztdourden08/tessera/primitives';
import { ControlMenuRow } from '@drizztdourden08/tessera/composites';
import { useWidgetPref } from '@drizztdourden08/brock-react';
import type { ViewMode } from '@app/compounds/ChecksTracker';
import { useStickyHeader } from '../behavior/useStickyHeader';
import {
  CHECKS_PREF_KEY, NOTIFY_PREF, NOTIFY_WHEN_CLOSED_PREF, VIEW_MODE_DEFAULT, VIEW_MODE_PREF, VIEW_OPTIONS,
} from '../checks.constants';
import { NOTIFY_HINT, NOTIFY_WHEN_CLOSED_HINT, PIN_HEADER_HINT } from './ChecksWidgetSettings.constants';

const ChecksWidgetSettings = () => {
  const [sticky, setSticky] = useStickyHeader();
  const [viewMode, setViewMode] = useWidgetPref<ViewMode>(CHECKS_PREF_KEY, VIEW_MODE_PREF, VIEW_MODE_DEFAULT);
  const [notify, setNotify] = useWidgetPref<boolean>(CHECKS_PREF_KEY, NOTIFY_PREF, true);
  const [notifyWhenClosed, setNotifyWhenClosed] = useWidgetPref<boolean>(CHECKS_PREF_KEY, NOTIFY_WHEN_CLOSED_PREF, true);

  return (
    <>
      <ControlMenuRow label="View">
        <SegmentedControl<ViewMode> value={viewMode} options={VIEW_OPTIONS} onChange={setViewMode} />
      </ControlMenuRow>
      <ControlMenuRow label="Pin header" hint={PIN_HEADER_HINT}>
        <Toggle checked={sticky} onChange={setSticky} />
      </ControlMenuRow>
      <ControlMenuRow label="Notifications" hint={NOTIFY_HINT}>
        <Toggle checked={notify} onChange={setNotify} />
      </ControlMenuRow>
      <ControlMenuRow label="While closed" hint={NOTIFY_WHEN_CLOSED_HINT}>
        <Toggle checked={notifyWhenClosed} onChange={setNotifyWhenClosed} disabled={!notify} />
      </ControlMenuRow>
    </>
  );
};

export { ChecksWidgetSettings };
