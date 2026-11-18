/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { MsuPackManifest } from '@rotp/game-data';
import type { MsuFile } from './msu.type';

interface FileColumn {
  id: string;
  label: Message | null;
}

interface MsuFilePanelProps {
  pack: string;
  manifest: MsuPackManifest;
  saveBase: MsuPackManifest | null;
  files: MsuFile[];
  readOnly: boolean;
  tabs: ReactNode;
  packPanel: ReactNode;
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
  onReload: () => void;
}

export type { MsuFilePanelProps, FileColumn };
