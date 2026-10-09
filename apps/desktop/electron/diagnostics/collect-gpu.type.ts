/* @layer electron-main @kind types */
interface RawGpuDevice {
  vendorId?: number;
  deviceId?: number;
  driverVendor?: string;
  driverVersion?: string;
  deviceString?: string;
  active?: boolean;
}

interface RawGpuInfo {
  gpuDevice?: RawGpuDevice[];
  auxAttributes?: Record<string, unknown>;
}

export type { RawGpuDevice, RawGpuInfo };
