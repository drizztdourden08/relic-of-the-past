/* @layer electron-main @kind types */
interface DevMode {
  dmSize: number;
  dmPelsWidth: number;
  dmPelsHeight: number;
  dmDisplayFrequency: number;
  dmFields: number;
}

interface Win32Bindings {
  enumDisplaySettings: (index: number) => DevMode | null;
  changeDisplaySettings: (mode: DevMode) => number;
  sizeofDevMode: number;
}

export type { DevMode, Win32Bindings };
