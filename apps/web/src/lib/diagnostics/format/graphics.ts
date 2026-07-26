/* @layer renderer-lib @kind logic */
/**
 * Graphics section. Host adapter facts and the renderer's WebGL view are merged
 * here because they answer the same question from two sides, and on the web build
 * only the WebGL half exists.
 */
import type { GpuDevice, GpuDiagnostics } from '@shared/types/diagnostics';
import type { WebglDiagnostics } from '../types';
import type { DebugSection } from './section';
import { section } from './section';
import { hex, orDash, yesNo } from './units';

const adapterLine = (device: GpuDevice): string => {
  const name = orDash(device.device ?? device.vendor);
  const ids = `[${hex(device.vendorId)}:${hex(device.deviceId)}]`;
  const driver = device.driverVersion ? ` driver ${device.driverVersion}` : '';
  return `Adapter: ${name} ${ids}${driver}${device.active ? ' (active)' : ''}`;
};

// Chromium reports several shades of on ('enabled', 'enabled_on', 'enabled_readback')
// and of off; only the off ones matter to a rendering report.
const disabledFeatures = (features: Record<string, string>): string[] =>
  Object.entries(features)
    .filter(([, status]) => !status.startsWith('enabled'))
    .map(([name, status]) => `${name}=${status}`);

const gpuLines = (gpu: GpuDiagnostics | null): string[] => {
  if (!gpu) return [];
  const disabled = disabledFeatures(gpu.features);
  return [
    ...gpu.devices.map(adapterLine),
    gpu.driverVersion ? `Driver: ${gpu.driverVersion}` : '',
    `Hardware acceleration: ${yesNo(gpu.hardwareAccelerated)}`,
    gpu.glVendor || gpu.glRenderer ? `GL: ${orDash(gpu.glVendor)} / ${orDash(gpu.glRenderer)}` : '',
    gpu.glVersion ? `GL version: ${gpu.glVersion}` : '',
    disabled.length > 0 ? `Not accelerated: ${disabled.join(', ')}` : 'All GPU features enabled',
  ].filter(Boolean);
};

const webglLines = (webgl: WebglDiagnostics | null): string[] => {
  if (!webgl) return ['WebGL: unavailable'];
  return [
    `WebGL${webgl.version}: ${webgl.vendor} / ${webgl.renderer}`,
    `WebGL version: ${webgl.glVersion} · GLSL: ${webgl.shadingLanguage}`,
    `Limits: max texture ${webgl.maxTextureSize} · max viewport ${webgl.maxViewport}`
      + ` · max renderbuffer ${webgl.maxRenderBufferSize} · antialias ${yesNo(webgl.antialias)}`,
  ];
};

const graphicsSection = (gpu: GpuDiagnostics | null, webgl: WebglDiagnostics | null): DebugSection =>
  section('Graphics', [...gpuLines(gpu), ...webglLines(webgl)]);

export { graphicsSection };
