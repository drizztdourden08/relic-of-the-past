/* @layer renderer-app @kind types */
interface PathRead {
  known: boolean;
  value: unknown;
}

interface SettingReset {
  changed: boolean;
  reset: () => void;
}

export type { PathRead, SettingReset };
