/* @layer shared-types @kind types */
import type { ControllerAddedInfo, ControllerJoystickSample, ControllerRawReport, DeviceEntry } from './controller-contract';
import type { UpdateInfo } from './updater-contract';
import type { StoreInstallProgress, StoreOpenInstall } from './store-contract.type';
import type { FfmpegState } from '@shared/types/ffmpeg-tool';
import type { OptimizeProgress } from '@shared/types/msu-optimize';

interface ImportProgress {
  kind: 'rom' | 'msu' | 'language' | 'sprite' | 'linkSprite';
  id: string;
  phase: 'download' | 'extract' | 'copy' | 'decode' | 'done' | 'error';
  loaded?: number;
  total?: number;
  message?: string;
}

interface EventContract {
  'window:maximized': (maximized: boolean) => void;
  'window:fullscreen': (fullscreen: boolean) => void;
  'log:entry': (entry: { channel: string; level: string; message: string }) => void;

  'updater:update-available': (info: UpdateInfo) => void;
  'updater:up-to-date': () => void;
  'updater:download-progress': (progress: { percent: number }) => void;
  'updater:download-complete': () => void;
  'updater:error': (error: string) => void;

  'import:progress': (progress: ImportProgress) => void;

  'ffmpeg:progress': (state: FfmpegState) => void;

  'msu:optimize:progress': (progress: OptimizeProgress) => void;

  'msu:openPack': (filePath: string) => void;

  'hub:deviceCode': (userCode: string) => void;

  'store:installProgress': (report: StoreInstallProgress) => void;
  'store:openInstall': (link: StoreOpenInstall) => void;

  'controller:added': (info: ControllerAddedInfo) => void;
  'controller:state': (deviceKey: string, buttons: boolean[], axes: number[]) => void;
  'controller:removed': (deviceKey: string) => void;
  'controller:devices': (devices: DeviceEntry[]) => void;
  'controller:raw': (report: ControllerRawReport) => void;
  'controller:joystick': (sample: ControllerJoystickSample) => void;
  'controller:hold-changed': (held: boolean) => void;
}

export type { EventContract, ImportProgress };
