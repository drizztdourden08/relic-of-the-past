/* @layer renderer-widgets @kind hook */
import { useState, useEffect } from 'react';
import type { InventoryViewMode } from '@shared/game/items/sprites';
import { STORAGE_KEY } from '../constants';

const useInventoryViewMode = () => {
  const [viewMode, setViewMode] = useState<InventoryViewMode>(() => {
    return (localStorage.getItem(STORAGE_KEY) as InventoryViewMode) || 'default';
  });

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setViewMode(e.newValue as InventoryViewMode);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return viewMode;
};

export { useInventoryViewMode };
