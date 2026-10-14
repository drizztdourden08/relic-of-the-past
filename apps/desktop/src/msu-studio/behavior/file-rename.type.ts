/* @layer renderer-components @kind types */
type FileRenameParams = {
  name: string;
  onRename: (from: string, to: string) => void;
};

export type { FileRenameParams };
