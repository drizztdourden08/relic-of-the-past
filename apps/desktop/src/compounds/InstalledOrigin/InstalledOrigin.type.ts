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

interface OriginFactsProps {
  author: string;
  semver: string;
  license: string;
  updateTo: string | null;
}

interface OriginActionsProps {
  busy: boolean;
  copyRefusal: string | null;
  updateTo: string | null;
  onDuplicate: () => void;
  onUpdate: () => void;
  onAskUninstall: () => void;
}

export type { InstalledOriginProps, OriginActionsProps, OriginFactsProps };
