/* @layer store-site @kind types */
import type { StoreVersion } from '@shared/store/types';

type VersionHistoryProps = {
  versions: readonly StoreVersion[];
  liveVersion: number | null;
  onDelete?: (version: StoreVersion) => void;
  busy?: boolean;
};

export type { VersionHistoryProps };
