/* @layer renderer-components @kind types */
import type { UpdaterPrefs } from '@shared/ipc/updater-contract';
import type { UpdateState } from '../../../../../hooks/useAutoUpdate';

interface UpdateDialogProps {
  open: boolean;
  state: UpdateState;
  /** False when this build can see an update but not install it (macOS today). */
  canInstall: boolean;
  /** null installs the newest release; a version string installs that exact build. */
  onApply: (version: string | null) => void;
  /** Sends the user to the release page to download it themselves. */
  onOpenReleasePage: (version: string | null) => void;
  onLoadVersions: () => Promise<void>;
  onSetPrefs: (prefs: UpdaterPrefs) => void;
  onClose: () => void;
}

export type { UpdateDialogProps };
