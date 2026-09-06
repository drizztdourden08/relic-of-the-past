/* @layer shared-types @kind logic */
/**
 * Event IPC channels, main → renderer: `webContents.send` ↔ `ipcRenderer.on`. Each value is the
 * LISTENER signature; the `onX(cb)` subscribers and the main-process `emit` derive from these.
 */

import type { ControllerAddedInfo, ControllerJoystickSample, ControllerRawReport, DeviceEntry } from './controller-contract';
import type { UpdateInfo } from './updater-contract';
import type { FfmpegState } from '@shared/types/ffmpeg-tool';
import type { OptimizeProgress } from '@shared/types/msu-optimize';

/** Progress of a data import (ROM / MSU / language / sprites), main → renderer. */
interface ImportProgress {
  kind: 'rom' | 'msu' | 'language' | 'sprite' | 'linkSprite';
  /** Correlation key, one of pack name, language code, or rom stem. */
  id: string;
  phase: 'download' | 'extract' | 'copy' | 'decode' | 'done' | 'error';
  /** Bytes downloaded, or item index for copy/extract. */
  loaded?: number;
  /** Content-length, or item count. */
  total?: number;
  /** Human-readable label or error text. */
  message?: string;
}

interface EventContract {
  'window:maximized': (maximized: boolean) => void;
  'window:fullscreen': (fullscreen: boolean) => void;
  'log:entry': (entry: { channel: string; level: string; message: string }) => void;

  // Auto-updater
  'updater:update-available': (info: UpdateInfo) => void;
  'updater:up-to-date': () => void;
  'updater:download-progress': (progress: { percent: number }) => void;
  'updater:download-complete': () => void;
  'updater:error': (error: string) => void;

  // Data imports (ROM / MSU / language / sprites)
  'import:progress': (progress: ImportProgress) => void;

  // Optional-ffmpeg install: every state the install passes through, so a progress bar
  // can follow the download and the verify without polling.
  'ffmpeg:progress': (state: FfmpegState) => void;

  // Normalising an MSU pack to one audio format: one report per file, for the measuring
  // pass and the converting pass alike, so a bar can follow either without polling.
  'msu:optimize:progress': (progress: OptimizeProgress) => void;

  // A .msul music pack the app was opened with (file association / open-file).
  'msu:openPack': (filePath: string) => void;

  // Controllers over the SDL3 native transport (see apps/desktop/electron/input/sdl3-source.ts)
  'controller:added': (info: ControllerAddedInfo) => void;
  'controller:state': (deviceKey: string, buttons: boolean[], axes: number[]) => void;
  'controller:removed': (deviceKey: string) => void;
  /** Full snapshot, covering devices SDL hasn't claimed. See device-availability.ts. */
  'controller:devices': (devices: DeviceEntry[]) => void;
  /** One HID report read while a diagnostic raw capture is open. See `controller:start-raw-capture`. */
  'controller:raw': (report: ControllerRawReport) => void;
  /** One joystick-level sample while a diagnostic joystick capture is open. See `controller:start-joystick-capture`. */
  'controller:joystick': (sample: ControllerJoystickSample) => void;
  /** Whether the gamepad subsystem is currently held open for a raw HID capture. See
   *  `controller:release-hold` / `controller:restore-hold`. */
  'controller:hold-changed': (held: boolean) => void;
}

export type { EventContract, ImportProgress };
