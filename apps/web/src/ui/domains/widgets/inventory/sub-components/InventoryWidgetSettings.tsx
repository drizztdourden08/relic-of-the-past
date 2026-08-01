/* @layer renderer-widgets @kind component */
import { useState } from 'react';
import type { InventoryViewMode } from '@shared/game/data';
import { Box, Text, SegmentedControl } from '../../../../design-system/primitives';
import { STORAGE_KEY, VIEW_OPTIONS } from '../inventory.constants';

const InventoryWidgetSettings = () => {
  const [viewMode, setViewMode] = useState<InventoryViewMode>(() => {
    return (localStorage.getItem(STORAGE_KEY) as InventoryViewMode) || 'default';
  });

  const handleChange = (v: InventoryViewMode) => {
    setViewMode(v);
    localStorage.setItem(STORAGE_KEY, v);
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: v }));
  };

  return (
    <Box className="widget-settings__row">
      <Text className="widget-settings__label">View</Text>
      <SegmentedControl value={viewMode} options={VIEW_OPTIONS} onChange={handleChange} />
    </Box>
  );
};

export { InventoryWidgetSettings };
