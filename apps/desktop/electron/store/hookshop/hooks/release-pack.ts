/* @layer electron-main @kind logic */
import type { InstalledRecord } from '@drizztdourden08/brock-catalog/main';
import { isStoreKind } from '@rotp/hub-contracts';
import { repointProfiles } from '../../repoint-profiles';

const releasePack = async (record: InstalledRecord, replacement: string | null): Promise<number> => {
  const { kind, installedName } = record;
  if (!isStoreKind(kind)) return 0;
  return (await repointProfiles({ kind, installedName }, replacement)).length;
};

export { releasePack };
