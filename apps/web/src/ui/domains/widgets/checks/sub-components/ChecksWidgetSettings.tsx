/* @layer renderer-widgets @kind component */
import { SegmentedControl, Toggle } from '@ds/primitives';
import { OptionRow } from '@ds/composites/Widget/sub-components/WidgetOptions';
import { useWidgetPref } from '@app/hooks/useWidgetPref';
import type { ViewMode } from '@domains/app/compounds/ChecksTracker';
import { useStickyHeader } from '../behavior/useStickyHeader';
import {
  CHECKS_PREF_KEY, NOTIFY_PREF, NOTIFY_WHEN_CLOSED_PREF, VIEW_MODE_DEFAULT, VIEW_MODE_PREF, VIEW_OPTIONS,
} from '../checks.constants';

const ChecksWidgetSettings = () => {
  const [sticky, setSticky] = useStickyHeader();
  const [viewMode, setViewMode] = useWidgetPref<ViewMode>(CHECKS_PREF_KEY, VIEW_MODE_PREF, VIEW_MODE_DEFAULT);
  const [notify, setNotify] = useWidgetPref<boolean>(CHECKS_PREF_KEY, NOTIFY_PREF, true);
  const [notifyWhenClosed, setNotifyWhenClosed] = useWidgetPref<boolean>(CHECKS_PREF_KEY, NOTIFY_WHEN_CLOSED_PREF, true);

  return (
    <>
      <OptionRow label="View">
        <SegmentedControl<ViewMode> value={viewMode} options={VIEW_OPTIONS} onChange={setViewMode} />
      </OptionRow>
      <OptionRow label="Pin header" hint="Keep the summary and filters in place">
        <Toggle checked={sticky} onChange={setSticky} />
      </OptionRow>
      <OptionRow label="Notifications" hint="A card over the game for each check or event you complete">
        <Toggle checked={notify} onChange={setNotify} />
      </OptionRow>
      <OptionRow label="While closed" hint="Keep notifying while this tracker is closed">
        <Toggle checked={notifyWhenClosed} onChange={setNotifyWhenClosed} disabled={!notify} />
      </OptionRow>
    </>
  );
};

export { ChecksWidgetSettings };
