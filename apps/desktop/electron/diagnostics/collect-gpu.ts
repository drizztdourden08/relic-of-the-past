/* @layer electron-main @kind logic */
import { app } from 'electron';
import type { GpuDevice, GpuDiagnostics } from '@shared/types/diagnostics';
import type { RawGpuDevice, RawGpuInfo } from './collect-gpu.type';

const text = (value: unknown): string | null => (typeof value === 'string' && value ? value : null);

const readGpuInfo = async (): Promise<RawGpuInfo> => {
  try {
    return (await app.getGPUInfo('complete')) as RawGpuInfo;
  } catch {
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
