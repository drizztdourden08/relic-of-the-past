/* @layer renderer-app @kind types */
interface BugFixRowProps {
  settingKey: string;
  checked: boolean;
  onToggle: (next: boolean) => void;
  disabled: boolean;
}

export type { BugFixRowProps };
