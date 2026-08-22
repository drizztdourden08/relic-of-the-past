/* @layer renderer-components @kind types */

interface LayerFileListProps {
  /** The layer's files, in the order the play mode will draw from them. */
  files: string[];
  /** Every audio file the pack holds, offered as additions. */
  available: string[];
  disabled?: boolean;
  onChange: (files: string[]) => void;
}

export type { LayerFileListProps };
