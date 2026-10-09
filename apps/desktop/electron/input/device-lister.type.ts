/* @layer electron-main @kind types */
interface ListedDevice {
  vendorId: number;
  productId: number;
  product: string;
  busType: 'usb' | 'bluetooth' | 'unknown';
}

type DeviceLister = () => ListedDevice[];

export type { DeviceLister, ListedDevice };
