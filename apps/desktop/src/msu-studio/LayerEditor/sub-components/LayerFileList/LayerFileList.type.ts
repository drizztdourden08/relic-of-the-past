/* @layer renderer-components @kind types */
interface LayerFileListProps {
  files: string[];
  available: string[];
  oneFileOnly?: boolean;
  disabled?: boolean;
  onChange: (files: string[]) => void;
}

export type { LayerFileListProps };
