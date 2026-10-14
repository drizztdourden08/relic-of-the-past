/* @layer renderer-components @kind types */
type LayerEditorFooterProps = {
  locked: boolean;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onRevert: () => void;
};

export type { LayerEditorFooterProps };
