/* @layer shared-types @kind logic */
/**
 * Fire-and-forget IPC channels, renderer → main: `ipcRenderer.send` ↔ `ipcMain.on`.
 * Single source of truth for each send channel's argument signature.
 */
import type { WidgetSlice } from '@shared/types/widget-relay';

interface SendContract {
  'window:minimize': () => void;
  'window:maximize': () => void;
  'window:close': () => void;
  'window:openDevTools': () => void;
  'window:toggleFullscreen': () => void;
  'window:setFullscreen': (value: boolean) => void;
  'window:setAspectRatioLock': (ratio: number, extraHeight: number) => void;
  /** UI shell settled AND painted, so the main window may be revealed. */
  'window:shellReady': () => void;
  /** Batched, pre-formatted renderer log lines for Data/debug/session.log. */
  'debug:appendSessionLog': (lines: string[]) => void;
  /** Closes that widget's window; the main window then docks it back. */
  'widget:dockBack': (id: string) => void;
  /** From the main window: one piece of state every pop-out should have. */
  'widget:publish': (slice: WidgetSlice) => void;
  /** From a pop-out once it is ready: asks the main window for a full snapshot. */
  'widget:subscribe': (id: string) => void;
}

export type { SendContract };
