/* @layer shared-types @kind types */
interface GeneralSettings {
  autosave: boolean;
  autoSaveEnabled: boolean;
  autoSaveIntervalSeconds: number;
  autoSaveMaxEntries: number;
  saveOnQuit: boolean;
  displayPerfInTitle: boolean;
  disableFrameDelay: boolean;
  vsync: boolean;
  turboEnabled: boolean;
  turboSpeed: number;
}

export type { GeneralSettings };
