/* @layer renderer-components @kind types */
import type { InstalledOrigin } from '@shared/store/installed-types';

interface InstalledOriginProps {
  origin: InstalledOrigin;
  /** The installed version. */
  semver: string;
  /** The newer version on the store, when there is one. */
  updateTo: string | null;
  /** Why a copy is not allowed; null when Duplicate may run. */
  copyRefusal: string | null;
  /** An action is running, so every button waits. */
  busy?: boolean;
  /** Why the last action failed, or null. */
  error?: string | null;
  onDuplicate: () => void;
  onUpdate: () => void;
  onOpenOnSite: () => void;
  /** Runs once the player confirms the uninstall in the bar's own dialog. */
  onUninstall: () => void;
}

export type { InstalledOriginProps };
