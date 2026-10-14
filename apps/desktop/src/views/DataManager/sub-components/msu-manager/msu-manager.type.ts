/* @layer renderer-components @kind types */
import type { InstalledPack } from '@rotp/hub-contracts';

interface MsuPackActionsParams {
  selected: string | null;
  setSelected: (name: string | null) => void;
  refresh: () => Promise<void>;
  packFor: (name: string) => InstalledPack | null;
  confirmUninstall: (pack: InstalledPack, onDone: () => void) => void;
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export type { MsuPackActionsParams };
