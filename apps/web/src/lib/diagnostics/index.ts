/* @layer renderer-lib @kind barrel */
export { collectRendererDiagnostics } from './collect-renderer';
export { buildDebugText } from './format/debug-text';

export type { DebugTextInput } from './format/debug-text';
export type {
  RendererDiagnostics, WebglDiagnostics, AudioDiagnostics, DisplayEnvironment, DeviceEnvironment,
} from './types';
