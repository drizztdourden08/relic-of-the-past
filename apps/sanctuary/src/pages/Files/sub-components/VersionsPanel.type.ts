/* @layer sanctuary-site @kind types */
import type { SanctuaryFile } from '@rotp/hub-contracts';
import type { FileActions } from '../behavior/useFileActions.type';

type VersionsPanelProps = {
  file: SanctuaryFile;
  canManage: boolean;
  busy: boolean;
  actions: FileActions['versions'];
  onDropVersion: (dropped: File) => void;
};

export type { VersionsPanelProps };
