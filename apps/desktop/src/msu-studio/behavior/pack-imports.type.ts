/* @layer renderer-components @kind types */
type PackImportsParams = {
  newPackName: string;
  setNewPackName: (name: string) => void;
  refresh: () => Promise<void>;
  setSelected: (pack: string) => void;
};

export type { PackImportsParams };
