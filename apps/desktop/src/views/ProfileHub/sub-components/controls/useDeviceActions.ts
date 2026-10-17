/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import type { DragEvent } from 'react';
import { setDeviceDragData } from './device-drag-data';
import type { DeviceAssignInfo, DeviceEntry } from './DeviceRow.type';

const useDeviceActions = (entry: DeviceEntry, onAssign: (device: DeviceAssignInfo) => void) => {
  const { drag, ready } = entry;

  const handleDragStart = useCallback((e: DragEvent) => {
    if (!ready) { e.preventDefault(); return; }
    setDeviceDragData(e, drag);
  }, [ready, drag]);

  const handleAssign = useCallback(() => {
    if (!ready) return;
    const { sdlType, displayName, vendorId, productId } = drag;
    onAssign({ sdlType, displayName, vendorId, productId });
  }, [ready, drag, onAssign]);

  return { handleDragStart, handleAssign };
};

export { useDeviceActions };
