/* @layer renderer-components @kind types */
import type { UpdateState } from '../../../../../hooks/useAutoUpdate';

interface UpdateDialogProps {
  open: boolean;
  state: UpdateState;
  onDownload: () => void;
  onInstall: () => void;
  onClose: () => void;
}

export type { UpdateDialogProps };
