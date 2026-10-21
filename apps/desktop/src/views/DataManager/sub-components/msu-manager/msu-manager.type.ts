/* @layer renderer-components @kind types */
import type { InstalledPack } from '@rotp/hub-contracts';
import type { MsuManagerModel } from '../../../../msu-studio/msu-manager.type';

interface MsuPackActionsParams {
  selected: string | null;
  setSelected: (name: string | null) => void;
  refresh: () => Promise<void>;
  packFor: (name: string) => InstalledPack | null;
  confirmUninstall: (pack: InstalledPack, onDone: () => void) => void;
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

interface MsuListPaneProps {
  section: 'create' | 'import' | 'packs';
  msu: MsuManagerModel;
  nameInstalled: boolean;
  error: string | null;
  isInstalled: (name: string) => boolean;
  onDelete: (name: string) => void;
}

export type { MsuListPaneProps, MsuPackActionsParams };
