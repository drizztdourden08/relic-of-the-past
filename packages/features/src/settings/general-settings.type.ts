/* @layer shared-types @kind types */
interface GeneralSettings {
  autoSaveEnabled: boolean;
  autoSaveIntervalSeconds: number;
  autoSaveMaxEntries: number;
  saveOnQuit: boolean;
  displayPerfInTitle: boolean;
  vsync: boolean;
  turboEnabled: boolean;
  turboSpeed: number;
}

export type { GeneralSettings };
