/* @layer renderer-components @kind types */
import type { InstalledPack } from '@shared/store/installed-types';

interface InstalledOriginBarProps {
  /** The install record of the item the editor shows. */
  pack: InstalledPack;
  /** The editable copy was written under this name; the editor selects it. */
  onDuplicated: (name: string) => void;
  /** The update landed under this name, which a new version may have changed. */
  onUpdated: (name: string) => void;
  onUninstalled: () => void;
}

export type { InstalledOriginBarProps };
