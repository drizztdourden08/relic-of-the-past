/* @layer renderer-other @kind logic */
import { Capacitor } from '@capacitor/core';

const isControllerSdl3Available = (): boolean => Capacitor.isPluginAvailable('ControllerSdl3');

export { isControllerSdl3Available };
