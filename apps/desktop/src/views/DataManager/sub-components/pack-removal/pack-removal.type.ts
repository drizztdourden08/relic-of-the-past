/* @layer renderer-components @kind types */
import type { InstalledPack } from '@rotp/hub-contracts';

interface PackRemovalBase {
  selected: string | null;
  setSelected: (key: string | null) => void;
  refresh: () => Promise<void>;
  packFor: (key: string) => InstalledPack | null;
  confirmUninstall: (pack: InstalledPack, onDone: () => void) => void;
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

interface DeletePrompt {
  title: string;
  message: string;
}

interface PackRemovalParams extends PackRemovalBase {
  promptFor: (key: string) => DeletePrompt;
  deleteItem: (key: string) => Promise<unknown>;
}

export type { PackRemovalBase, PackRemovalParams };
