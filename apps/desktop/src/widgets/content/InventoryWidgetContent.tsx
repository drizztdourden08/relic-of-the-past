/**
 * InventoryWidgetContent — Content for the Inventory widget.
 * Wraps TrackerInventory with data subscription + view mode state.
 */
import { useState, useEffect } from 'react';
import { onInventoryChanged, getCurrentInventory } from '../../../lib/game';
import { TrackerInventory } from '../../views/TrackerView/sub-components/TrackerInventory';
import { SegmentedControl } from '../../primitives';
import type { InventoryViewMode } from '@shared/game/items/sprites';

const VIEW_OPTIONS: { value: InventoryViewMode; label: string }[] = [
  { value: 'default', label: 'List' },
  { value: 'ingame', label: 'SNES' },
  { value: 'compact', label: 'Grid' },
];

const STORAGE_KEY = 'inventory-view-mode';

const InventoryWidgetContent = () => {
  const [inventory, setInventory] = useState<Set<string>>(() => getCurrentInventory());
  const [viewMode, setViewMode] = useState<InventoryViewMode>(() => {
    return (localStorage.getItem(STORAGE_KEY) as InventoryViewMode) || 'default';
  });

  useEffect(() => onInventoryChanged((inv) => setInventory(new Set(inv))), []);

  // Listen for view mode changes from the settings dropdown
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setViewMode(e.newValue as InventoryViewMode);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return <TrackerInventory inventory={inventory} viewMode={viewMode} />;
}

/** Settings content for the inventory widget (rendered inside the dropdown) */
const InventoryWidgetSettings = () => {
  const [viewMode, setViewMode] = useState<InventoryViewMode>(() => {
    return (localStorage.getItem(STORAGE_KEY) as InventoryViewMode) || 'default';
  });

  const handleChange = (v: InventoryViewMode) => {
    setViewMode(v);
    localStorage.setItem(STORAGE_KEY, v);
    // Dispatch storage event so the content component picks up the change
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: v }));
  };

  return (
    <div className="widget-settings__row">
      <span className="widget-settings__label">View</span>
      <SegmentedControl value={viewMode} options={VIEW_OPTIONS} onChange={handleChange} />
    </div>
  );
}

export { InventoryWidgetContent, InventoryWidgetSettings };
