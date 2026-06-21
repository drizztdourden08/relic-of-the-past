/* @layer shared-types @kind logic */
/**
 * Event IPC channels, main → renderer: `webContents.send` ↔ `ipcRenderer.on`.
 * Each value is the LISTENER signature (the args the renderer receives). The
 * friendly `onX(cb)` subscribers and the main-process `emit` are both derived
 * from these.
 */

/** Progress of a data import (ROM / MSU / language / sprites), main → renderer. */
interface ImportProgress {
  kind: 'rom' | 'msu' | 'language' | 'sprite' | 'linkSprite';
  /** Correlation key — pack name / language code / rom stem. */
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

  // HID reader (main-process node-hid)
  'hid:report': (deviceKey: string, vendorId: number, productId: number, data: Buffer) => void;
  'hid:device-opened': (info: { deviceKey: string; vendorId: string; productId: string; product: string }) => void;
  'hid:disconnect': (info: { deviceKey: string; product: string; error?: string }) => void;
  'hid:error': (info: { deviceKey: string; error: string }) => void;
  'hid:main-perf': (msg: string) => void;

  // Auto-updater
  'updater:update-available': (info: { version: string; releaseNotes: string; releaseDate: string }) => void;
  'updater:up-to-date': () => void;
  'updater:download-progress': (progress: { percent: number; bytesPerSecond: number; transferred: number; total: number }) => void;
  'updater:download-complete': () => void;
  'updater:error': (error: string) => void;

  // Data imports (ROM / MSU / language / sprites)
  'import:progress': (progress: ImportProgress) => void;
}

export type { EventContract, ImportProgress };
