/* @layer renderer-components @kind types */
type SetExportParams = {
  id: string | null;
  dirty: boolean;
  saveNow: () => Promise<void>;
};

export type { SetExportParams };
