/* @layer electron-main @kind types */
/**
 * A device found by enumeration alone — no opening, reading, or writing.
 * See device-lister.ts for how the active source(s) are selected.
 */
interface ListedDevice {
  vendorId: number;
  productId: number;
  product: string;
  busType: 'usb' | 'bluetooth' | 'unknown';
}

type DeviceLister = () => ListedDevice[];

export type { DeviceLister, ListedDevice };
