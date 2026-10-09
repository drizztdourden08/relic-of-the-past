/* @layer renderer-other @kind logic */
import { registerPlugin } from '@capacitor/core';
import type { ControllerSdl3PluginApi } from '../controller-sdl3.type';

let cached: ControllerSdl3PluginApi | null = null;

const controllerSdl3Plugin = (): ControllerSdl3PluginApi => {
  cached ??= registerPlugin<ControllerSdl3PluginApi>('ControllerSdl3');
  return cached;
};

export { controllerSdl3Plugin };
