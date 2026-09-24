/* @layer shared-types @kind logic */
/**
 * Fire-and-forget IPC channels, renderer → main: `ipcRenderer.send` ↔ `ipcMain.on`.
 * Single source of truth for each send channel's argument signature.
 */
import type { WidgetSlice } from '@shared/types/widget-relay';
import type { DockEdge, WidgetFrame } from '@shared/types/widget-layout';

/** Where a popped widget goes when its window closes: an edge, floating, or its default edge. */
type DockBackTarget = DockEdge | 'float';

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
  /** Closes that widget's window; the main window then puts it back where asked, or on its default edge. */
  'widget:dockBack': (id: string, where?: DockBackTarget) => void;
  /** From a popped window: whether it snaps against the app and other popped windows. */
  'widget:setSnap': (id: string, on: boolean) => void;
  /** From a popped window: a frame change (opacity) for the main window to keep. */
  'widget:setFrame': (id: string, patch: Partial<WidgetFrame>) => void;
  /** From the main window: one piece of state every pop-out should have. */
  'widget:publish': (slice: WidgetSlice) => void;
  /** From a pop-out once it is ready: asks the main window for a full snapshot. */
  'widget:subscribe': (id: string) => void;
}

export type { DockBackTarget, SendContract };
