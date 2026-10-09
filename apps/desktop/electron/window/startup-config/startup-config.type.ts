/* @layer electron-main @kind types */
interface StartupConfig {
  windowSize: { width: number; height: number } | null;
  widgets: string[];
  fresh: boolean;
}

export type { StartupConfig };
