/* @layer renderer-components @kind types */
import type { InstalledOrigin } from '@rotp/hub-contracts';

interface InstalledOriginProps {
  origin: InstalledOrigin;
  semver: string;
  updateTo: string | null;
  copyRefusal: string | null;
  busy?: boolean;
  error?: string | null;
  onDuplicate: () => void;
  onUpdate: () => void;
  onOpenOnSite: () => void;
  onUninstall: () => void;
}

export type { InstalledOriginProps };
