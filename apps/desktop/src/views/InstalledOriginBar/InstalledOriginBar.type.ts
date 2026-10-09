/* @layer renderer-components @kind types */
import type { InstalledPack } from '@rotp/hub-contracts';

interface InstalledOriginBarProps {
  pack: InstalledPack;
  onDuplicated: (name: string) => void;
  onUpdated: (name: string) => void;
  onUninstalled: () => void;
}

type ConfirmRequest = (title: string, message: string, onConfirm: () => void) => void;

export type { ConfirmRequest, InstalledOriginBarProps };
