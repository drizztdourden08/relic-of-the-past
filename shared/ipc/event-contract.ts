/* @layer shared-types @kind logic */
/**
 * Event IPC channels, main → renderer: `webContents.send` ↔ `ipcRenderer.on`. Each value is the
 * LISTENER signature; the `onX(cb)` subscribers and the main-process `emit` derive from these.
 */

import type { ControllerAddedInfo, ControllerJoystickSample, ControllerRawReport, DeviceEntry } from './controller-contract';
import type { UpdateInfo } from './updater-contract';
import type { StoreInstallProgress, StoreOpenInstall } from './store-contract';
import type { FfmpegState } from '@shared/types/ffmpeg-tool';
import type { OptimizeProgress } from '@shared/types/msu-optimize';
import type { PoppedWidget, PoppedWindowState, WidgetFrame, WindowBounds, WindowPoint } from '@shared/types/widget-layout';
import type { DockBackTarget } from './send-contract';
import type { WidgetSlice } from '@shared/types/widget-relay';

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

  // The device-code sign-in: the user code to confirm on the site, sent as soon as the API
  // minted it, so the account card can show it while the browser opens.
  'hub:deviceCode': (userCode: string) => void;

  // The Hookshop: each step of a running install, and a store install link the browser
  // opened (in this process, or handed over by the process the link started).
  'store:installProgress': (report: StoreInstallProgress) => void;
  'store:openInstall': (link: StoreOpenInstall) => void;

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
  /** To every pop-out: a piece of state the main window published. */
  'widget:relay': (slice: WidgetSlice) => void;
  /** To the main window: a pop-out asked for a full snapshot. */
  'widget:snapshotRequest': (id: string) => void;
  /** To the main window: that widget's window was closed, by the user or by dockBack, and where it asked to go. */
  'widget:closed': (id: string, where?: DockBackTarget) => void;
  /** To the main window: that widget's window moved or resized. */
  'widget:bounds': (id: string, bounds: WindowBounds) => void;
  /** To the main window: a popped window is being dragged over the app at that content point; null once it left. */
  'widget:dragOver': (id: string, point: WindowPoint | null) => void;
  /** To the main window: a popped window was released over the app at that content point. */
  'widget:dropIn': (id: string, point: WindowPoint) => void;
  /** To the main window: a popped window's persisted facts changed (pin, snap, link). */
  'widget:popped': (id: string, patch: Partial<PoppedWidget>) => void;
  /** To the main window: a popped window changed its own frame (opacity). */
  'widget:frame': (id: string, patch: Partial<WidgetFrame>) => void;
  /** To a popped window: the window facts it shows changed. */
  'widget:windowState': (state: PoppedWindowState) => void;
}

export type { EventContract, ImportProgress };
