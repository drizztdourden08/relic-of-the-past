/* @layer shared-types @kind logic */
/**
 * Host hardware/OS readout behind the debug-info block, collected in the main process (none of
 * it is reachable from the renderer sandbox). Deliberately free of anything identifying (host
 * name, user name, file path) because it is meant to be pasted into a public bug report.
 */

interface DiagnosticsRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DisplayDiagnostics {
  id: number;
  label: string;
  primary: boolean;
  internal: boolean;
  /** Logical (DIP) bounds in the virtual desktop, as the window manager sees them. */
  bounds: DiagnosticsRect;
  /** Native resolution, the logical size multiplied by the scale factor. */
  nativeSize: { width: number; height: number };
  workArea: DiagnosticsRect;
  scaleFactor: number;
  rotation: number;
  refreshHz: number | null;
  colorDepth: number;
  depthPerComponent: number;
  colorSpace: string;
  monochrome: boolean;
  touchSupport: string;
}

interface CpuDiagnostics {
  model: string;
  logicalCores: number;
  speedMhz: number;
  arch: string;
}

interface MemoryDiagnostics {
  totalBytes: number;
  freeBytes: number;
  swapTotalBytes: number | null;
  swapFreeBytes: number | null;
}

interface GpuDevice {
  vendorId: number;
  deviceId: number;
  vendor: string | null;
  device: string | null;
  driverVersion: string | null;
  active: boolean;
}

interface GpuDiagnostics {
  devices: GpuDevice[];
  glVendor: string | null;
  glRenderer: string | null;
  glVersion: string | null;
  driverVersion: string | null;
  hardwareAccelerated: boolean;
  /** Per-feature acceleration status ('enabled', 'disabled_software', ...). */
  features: Record<string, string>;
}

interface OsDiagnostics {
  platform: string;
  /** Human-readable OS name, e.g. the edition string on Windows. */
  version: string;
  release: string;
  arch: string;
  uptimeSeconds: number;
  locale: string;
  systemLocale: string;
  preferredLanguages: string[];
  timeZone: string;
  onBattery: boolean;
}

interface RuntimeVersions {
  node: string;
  v8: string;
  chrome: string;
  electron: string;
}

interface SystemDiagnostics {
  os: OsDiagnostics;
  cpu: CpuDiagnostics;
  memory: MemoryDiagnostics;
  gpu: GpuDiagnostics;
  displays: DisplayDiagnostics[];
  versions: RuntimeVersions;
}

export type {
  DiagnosticsRect,
  DisplayDiagnostics,
  CpuDiagnostics,
  MemoryDiagnostics,
  GpuDevice,
  GpuDiagnostics,
  OsDiagnostics,
  RuntimeVersions,
  SystemDiagnostics,
};
