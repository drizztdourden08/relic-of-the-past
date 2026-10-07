/* @layer renderer-widgets @kind component */
import type { InventoryViewMode } from '@shared/game/data';
import { Box, Text, SegmentedControl } from '../../../../design-system/primitives';
import { useInventoryViewMode } from '../behavior/useInventoryViewMode';
import { VIEW_OPTIONS } from '../inventory.constants';

const InventoryWidgetSettings = () => {
  const [viewMode, setViewMode] = useInventoryViewMode();

  return (
    <Box className="widget-settings__row">
      <Text className="widget-settings__label">View</Text>
      <SegmentedControl<InventoryViewMode> value={viewMode} options={VIEW_OPTIONS} onChange={setViewMode} />
    </Box>
  );
};

export { InventoryWidgetSettings };
