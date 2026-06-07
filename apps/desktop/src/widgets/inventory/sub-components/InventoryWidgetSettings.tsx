/* @layer renderer-widgets @kind component */
import { useState } from 'react';
import type { InventoryViewMode } from '@shared/game/items/sprites';
import { SegmentedControl } from '../../../components/primitives';
import { STORAGE_KEY, VIEW_OPTIONS } from '../constants';

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
    <div className="widget-settings__row">
      <span className="widget-settings__label">View</span>
      <SegmentedControl value={viewMode} options={VIEW_OPTIONS} onChange={handleChange} />
    </div>
  );
};

export { InventoryWidgetSettings };
