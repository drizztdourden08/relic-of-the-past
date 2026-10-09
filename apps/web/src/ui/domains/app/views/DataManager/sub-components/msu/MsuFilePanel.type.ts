/* @layer renderer-components @kind types */
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import type { MsuFile } from './msu.type';

interface MsuFilePanelProps {
  pack: string;
  manifest: MsuPackManifest;
  saveBase: MsuPackManifest | null;
  files: MsuFile[];
  readOnly: boolean;
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
  onReload: () => void;
}

export type { MsuFilePanelProps };
