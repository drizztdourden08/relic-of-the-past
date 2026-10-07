/* @layer renderer-widgets @kind component */
import { SegmentedControl, Toggle } from '@ds/primitives';
import { OptionRow } from '@ds/composites/Widget';
import { useWidgetPref } from '@app/hooks/useWidgetPref';
import type { ViewMode } from '@domains/app/compounds/ChecksTracker';
import { useStickyHeader } from '../behavior/useStickyHeader';
import { CHECKS_PREF_KEY, VIEW_MODE_DEFAULT, VIEW_MODE_PREF, VIEW_OPTIONS } from '../checks.constants';

const ChecksWidgetSettings = () => {
  const [sticky, setSticky] = useStickyHeader();
  const [viewMode, setViewMode] = useWidgetPref<ViewMode>(CHECKS_PREF_KEY, VIEW_MODE_PREF, VIEW_MODE_DEFAULT);

  return (
    <>
      <OptionRow label="View">
        <SegmentedControl<ViewMode> value={viewMode} options={VIEW_OPTIONS} onChange={setViewMode} />
      </OptionRow>
      <OptionRow label="Pin header" hint="Keep the summary and filters in place">
        <Toggle checked={sticky} onChange={setSticky} />
      </OptionRow>
    </>
  );
};

export { ChecksWidgetSettings };
