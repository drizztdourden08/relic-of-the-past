/* @layer root-config @kind types */
import type { SanctuaryFile } from '@rotp/hub-contracts';

type StoredFile = Omit<SanctuaryFile, 'versions' | 'currentVersion'> &
  Partial<Pick<SanctuaryFile, 'versions' | 'currentVersion'>>;

export type { StoredFile };
