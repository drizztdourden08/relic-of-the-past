/* @layer renderer-components @kind types */
type StudioActionsParams = {
  readOnly: boolean;
  dirty: boolean;
  saving: boolean;
  exporting: boolean;
  onSave: () => Promise<void>;
  onExport: () => Promise<void>;
};

export type { StudioActionsParams };
