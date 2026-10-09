/* @layer electron-main @kind types */
interface MacBindings {
  mainDisplayId: (...args: unknown[]) => number;
  copyAllModes: (...args: unknown[]) => unknown;
  copyCurrentMode: (...args: unknown[]) => unknown;
  refreshRate: (...args: unknown[]) => number;
  width: (...args: unknown[]) => number;
  height: (...args: unknown[]) => number;
  count: (...args: unknown[]) => number;
  valueAt: (...args: unknown[]) => unknown;
  setMode: (...args: unknown[]) => number;
  release: (...args: unknown[]) => void;
}

export type { MacBindings };
