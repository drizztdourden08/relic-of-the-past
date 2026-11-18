/* @layer renderer-widgets @kind component */
import { SegmentedControl, Toggle } from '@drizztdourden08/tessera/primitives';
import { ControlMenuRow } from '@drizztdourden08/tessera/composites';
import { useT, useWidgetPref } from '@drizztdourden08/brock-react';
import type { ViewMode } from '@app/compounds/ChecksTracker';
import { useStickyHeader } from '../behavior/useStickyHeader';
import {
  CHECKS_PREF_KEY, NOTIFY_PREF, NOTIFY_WHEN_CLOSED_PREF, VIEW_MODE_DEFAULT, VIEW_MODE_PREF, viewOptions,
} from '../ChecksWidget.constants';
import { notifyHint, notifyWhenClosedHint, pinHeaderHint } from './ChecksWidgetSettings.constants';

const ChecksWidgetSettings = () => {
  const t = useT();
  const [sticky, setSticky] = useStickyHeader();
  const [viewMode, setViewMode] = useWidgetPref<ViewMode>(CHECKS_PREF_KEY, VIEW_MODE_PREF, VIEW_MODE_DEFAULT);
  const [notify, setNotify] = useWidgetPref<boolean>(CHECKS_PREF_KEY, NOTIFY_PREF, true);
  const [notifyWhenClosed, setNotifyWhenClosed] = useWidgetPref<boolean>(CHECKS_PREF_KEY, NOTIFY_WHEN_CLOSED_PREF, true);

  return (
    <>
      <ControlMenuRow label={t('views-checks:view.label')}>
        <SegmentedControl<ViewMode> value={viewMode} options={viewOptions(t)} onChange={setViewMode} />
      </ControlMenuRow>
      <ControlMenuRow label={t('views-checks:pin.label')} hint={pinHeaderHint(t)}>
        <Toggle checked={sticky} onChange={setSticky} />
      </ControlMenuRow>
      <ControlMenuRow label={t('views-checks:notify.label')} hint={notifyHint(t)}>
        <Toggle checked={notify} onChange={setNotify} />
      </ControlMenuRow>
      <ControlMenuRow label={t('views-checks:closed.label')} hint={notifyWhenClosedHint(t)}>
        <Toggle checked={notifyWhenClosed} onChange={setNotifyWhenClosed} disabled={!notify} />
      </ControlMenuRow>
    </>
  );
};

export { ChecksWidgetSettings };
