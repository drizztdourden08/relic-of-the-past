/* @layer shared-platform @kind logic */
/**
 * Window-control port, the first carved capability. It covers exactly the window
 * surface the titlebar uses today (min/max/close/fullscreen/always-on-top + the
 * maximized/fullscreen state and their change events). Electron fulfills it via
 * window.api; mobile hosts return no-ops.
 */

type Unsub = () => void;

interface WindowControlsPort {
  minimize: () => void;
  toggleMaximize: () => void;
  close: () => void;
  toggleFullscreen: () => void;
  setFullscreen: (on: boolean) => void;
  setAspectRatioLock: (ratio: number, extraHeight: number) => void;
  setAlwaysOnTop: (on: boolean) => Promise<boolean>;
  openDevTools: () => void;
  isMaximized: () => Promise<boolean>;
  isFullscreen: () => Promise<boolean>;
  onMaximizedChange: (cb: (value: boolean) => void) => Unsub;
  onFullscreenChange: (cb: (value: boolean) => void) => Unsub;
}

export type { WindowControlsPort, Unsub };
