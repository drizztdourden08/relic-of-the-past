/* @layer renderer-components @kind types */
interface PackImportParams {
  refresh: () => Promise<void>;
  onImported: (pack: string) => void;
}

export type { PackImportParams };
