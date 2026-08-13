/* @layer shared-types @kind logic */
/**
 * Fire-and-forget IPC channels, renderer → main: `ipcRenderer.send` ↔ `ipcMain.on`.
 * Single source of truth for each send channel's argument signature.
 */

interface SendContract {
  'window:minimize': () => void;
  'window:maximize': () => void;
  'window:close': () => void;
  'window:openDevTools': () => void;
  'window:toggleFullscreen': () => void;
  'window:setFullscreen': (value: boolean) => void;
  'window:setAspectRatioLock': (ratio: number, extraHeight: number) => void;
  /** UI shell settled AND painted — the main window may be revealed. */
  'window:shellReady': () => void;
}

export type { SendContract };
