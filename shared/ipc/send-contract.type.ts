/* @layer shared-types @kind types */
interface SendContract {
  'window:minimize': () => void;
  'window:maximize': () => void;
  'window:close': () => void;
  'window:openDevTools': () => void;
  'window:toggleFullscreen': () => void;
  'window:setFullscreen': (value: boolean) => void;
  'window:setAspectRatioLock': (ratio: number, extraHeight: number) => void;
  'window:shellReady': () => void;
  'debug:appendSessionLog': (lines: string[]) => void;
}

export type { SendContract };
