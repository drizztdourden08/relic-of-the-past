/* @layer electron-main @kind logic */
import { packOfRecord } from '@rotp/hub-contracts';
import type { InstalledPack } from '@rotp/hub-contracts';
import { hookshopHolder } from './hookshop-holder';

const installedPacks = async (): Promise<InstalledPack[]> => {
  const records = (await hookshopHolder.catalog?.installed()) ?? [];
  return records.map(packOfRecord).filter((pack): pack is InstalledPack => pack !== null);
};

export { installedPacks };
