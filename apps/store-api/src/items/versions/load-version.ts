/* @layer store-api @kind logic */
import type { StoreVersion } from '@rotp/hub-contracts';
import { notFound } from '@rotp/hub-server';
import { versionOf } from './version-of';
import type { VersionList } from './versions.type';

const loadVersion = (item: VersionList, raw: string): StoreVersion => {
  const n = Number(raw);
  const version = Number.isInteger(n) ? versionOf(item, n) : null;
  if (!version) throw notFound('No such version.');
  return version;
};

export { loadVersion };
