/* @layer renderer-components @kind logic */
/**
 * Sets the drag payload a device card uses to hand itself to the binding
 * editor (useDragDrop.ts reads these same keys back out). Shared so
 * DeviceCard and AdapterDeviceCard agree on the wire format.
 */
interface DeviceDragInfo {
  id: string;
  displayName: string;
  sdlType: string | null;
  vendorId: string | null;
  productId: string | null;
}

const setDeviceDragData = (e: React.DragEvent, info: DeviceDragInfo): void => {
  e.dataTransfer.setData('application/x-device-id', info.id);
  e.dataTransfer.setData('application/x-device-name', info.displayName);
  e.dataTransfer.setData('application/x-sdl-type', info.sdlType ?? '');
  e.dataTransfer.setData('application/x-vid', info.vendorId ?? '');
  e.dataTransfer.setData('application/x-pid', info.productId ?? '');
  e.dataTransfer.effectAllowed = 'copy';
};

export { setDeviceDragData };
export type { DeviceDragInfo };
