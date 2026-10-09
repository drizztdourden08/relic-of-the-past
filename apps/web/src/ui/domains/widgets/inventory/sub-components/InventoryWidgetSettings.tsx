/* @layer renderer-widgets @kind component */
import type { InventoryViewMode } from '@shared/game/data';
import { SegmentedControl } from '@drizztdourden08/tessera/primitives';
import { ControlMenuRow } from '@drizztdourden08/tessera/composites';
import { useInventoryViewMode } from '../behavior/useInventoryViewMode';
import { VIEW_OPTIONS } from '../inventory.constants';

const InventoryWidgetSettings = () => {
  const [viewMode, setViewMode] = useInventoryViewMode();

  return (
    <ControlMenuRow label="View">
      <SegmentedControl<InventoryViewMode> value={viewMode} options={VIEW_OPTIONS} onChange={setViewMode} />
    </ControlMenuRow>
  );
};

export { InventoryWidgetSettings };
