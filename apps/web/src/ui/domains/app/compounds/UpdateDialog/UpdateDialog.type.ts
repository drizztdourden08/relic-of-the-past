/* @layer renderer-components @kind types */
import type { UpdaterPrefs } from '@shared/ipc/updater-contract';
import type { UpdateState } from '../../../../../hooks/useAutoUpdate';

interface UpdateDialogProps {
  open: boolean;
  state: UpdateState;
  canInstall: boolean;
  onApply: (version: string | null) => void;
  onOpenReleasePage: (version: string | null) => void;
  onLoadVersions: () => Promise<void>;
  onSetPrefs: (prefs: UpdaterPrefs) => void;
  onReportBug: () => void;
  onClose: () => void;
}

export type { UpdateDialogProps };
