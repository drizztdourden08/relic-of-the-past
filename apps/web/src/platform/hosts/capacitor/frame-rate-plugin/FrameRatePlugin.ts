/* @layer renderer-other @kind logic */
import { registerPlugin } from '@capacitor/core';
import type { FrameRatePluginApi } from './frame-rate-plugin.type';

const FrameRatePlugin = registerPlugin<FrameRatePluginApi>('FrameRate');

export { FrameRatePlugin };
