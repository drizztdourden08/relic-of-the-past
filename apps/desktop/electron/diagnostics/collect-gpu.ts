/* @layer electron-main @kind logic */
/**
 * GPU readout. The renderer can only see the ANGLE string WebGL hands it; the main
 * process additionally knows the PCI ids, the driver version, which adapter is
 * active on a hybrid-graphics machine, and which accelerated features Chromium
 * actually turned on.
 */
import { app } from 'electron';
import type { GpuDevice, GpuDiagnostics } from '@shared/types/diagnostics';

// getGPUInfo resolves an untyped bag whose shape varies by platform and driver;
// these narrow only the fields reported below.
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

const text = (value: unknown): string | null => (typeof value === 'string' && value ? value : null);

const readGpuInfo = async (): Promise<RawGpuInfo> => {
  try {
    return (await app.getGPUInfo('complete')) as RawGpuInfo;
  } catch {
    // --disable-gpu, or the info process never reported back
    return {};
  }
};

const readFeatures = (): Record<string, string> => {
  try {
    return app.getGPUFeatureStatus() as unknown as Record<string, string>;
  } catch {
    return {};
  }
};

const toDevice = (raw: RawGpuDevice): GpuDevice => ({
  vendorId: raw.vendorId ?? 0,
  deviceId: raw.deviceId ?? 0,
  vendor: text(raw.driverVendor),
  device: text(raw.deviceString),
  driverVersion: text(raw.driverVersion),
  active: raw.active === true,
});

const collectGpu = async (): Promise<GpuDiagnostics> => {
  const info = await readGpuInfo();
  const aux = info.auxAttributes ?? {};
  const devices = (info.gpuDevice ?? []).map(toDevice);
  const features = readFeatures();
  return {
    devices,
    glVendor: text(aux.glVendor),
    glRenderer: text(aux.glRenderer),
    glVersion: text(aux.glVersion),
    driverVersion: text(aux.driverVersion) ?? devices.find((d) => d.active)?.driverVersion ?? null,
    hardwareAccelerated: features.gpu_compositing === 'enabled',
    features,
  };
};

export { collectGpu };
