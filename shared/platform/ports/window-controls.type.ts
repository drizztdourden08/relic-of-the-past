/* @layer shared-platform @kind types */
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
