/* @layer renderer-widgets @kind component */
import type { InventoryViewMode } from '@shared/game/data';
import { SegmentedControl } from '@ds/primitives';
import { OptionRow } from '@ds/composites/Widget';
import { useInventoryViewMode } from '../behavior/useInventoryViewMode';
import { VIEW_OPTIONS } from '../inventory.constants';

const InventoryWidgetSettings = () => {
  const [viewMode, setViewMode] = useInventoryViewMode();

  return (
    <OptionRow label="View">
      <SegmentedControl<InventoryViewMode> value={viewMode} options={VIEW_OPTIONS} onChange={setViewMode} />
    </OptionRow>
  );
};

export { InventoryWidgetSettings };
