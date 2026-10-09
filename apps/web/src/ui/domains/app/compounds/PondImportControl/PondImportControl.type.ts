/* @layer renderer-components @kind types */

interface PondImportSource {
  id: string;
  label: string;
}

interface PondImportControlProps {
  sources: readonly PondImportSource[];
  value: string;
  disabled?: boolean;
  onValueChange: (id: string) => void;
  onImport: () => void;
}

export type { PondImportControlProps, PondImportSource };
