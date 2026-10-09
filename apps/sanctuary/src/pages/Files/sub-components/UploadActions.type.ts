/* @layer sanctuary-site @kind types */
type UploadActionsProps = {
  canUpload: boolean;
  onDrop: (files: File[]) => void;
};

export type { UploadActionsProps };
