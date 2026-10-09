/* @layer electron-main @kind types */
interface DebugReportLogFile {
  name: string;
  contents: string;
}

interface DebugReportCollectedFiles {
  settingsJson: unknown;
  profileJson: unknown;
  randomizerJson: unknown;
  inputProfilesJson: unknown;
  logFiles: DebugReportLogFile[];
}

export type { DebugReportCollectedFiles, DebugReportLogFile };
