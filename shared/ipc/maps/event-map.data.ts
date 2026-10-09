/* @layer shared-types @kind data */
import type { EventContract } from '../event-contract.type';
import { SITE_EVENT_MAP } from './site-maps.data';

const EVENT_MAP = {
  onMaximizedChange: 'window:maximized',
  onFullscreenChange: 'window:fullscreen',
  onLogEntry: 'log:entry',
  onImportProgress: 'import:progress',
  onMsuOpenPack: 'msu:openPack',
  ...SITE_EVENT_MAP,
  onMsuOptimizeProgress: 'msu:optimize:progress',
  onFfmpegProgress: 'ffmpeg:progress',
  onControllerAdded: 'controller:added',
  onControllerState: 'controller:state',
  onControllerRemoved: 'controller:removed',
  onControllerDevices: 'controller:devices',
  onControllerRaw: 'controller:raw',
  onControllerJoystick: 'controller:joystick',
  onControllerHoldChanged: 'controller:hold-changed',
} as const satisfies Record<string, keyof EventContract>;

export { EVENT_MAP };
