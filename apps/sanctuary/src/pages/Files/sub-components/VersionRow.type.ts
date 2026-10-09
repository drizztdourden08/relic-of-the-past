/* @layer sanctuary-site @kind types */
import type { FileVersion } from '@rotp/hub-contracts';

type VersionRowProps = {
  version: FileVersion;
  current: boolean;
  canManage: boolean;
  busy: boolean;
  onDownload: (n: number) => void;
  onRestore: (n: number) => void;
  onDelete: (n: number) => void;
};

export type { VersionRowProps };
