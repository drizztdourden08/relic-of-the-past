/* @layer store-api @kind logic */
import type { StoreItem, StoreVersion } from '@rotp/hub-contracts';
import { notFound } from '@rotp/hub-server';
import { versionOf } from '../versions';

const versionToDecide = (item: StoreItem, n: number): StoreVersion => {
  const version = versionOf(item, n);
  if (!version) throw notFound('No such version.');
  return version;
};

export { versionToDecide };
