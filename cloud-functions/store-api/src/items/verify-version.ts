/* @layer store-api @kind logic */
import { readFirstEntry } from '@rotp/hub-contracts';
import { factsFor } from '@rotp/languages';
import { CONTAINER_MANIFEST } from '@rotp/hub-contracts';
import { STORE_LIMITS } from '@rotp/hub-contracts';
import type { KindFacts, StoreItem, StoreVersion } from '@rotp/hub-contracts';
import { badRequest } from '@rotp/hub-server';
import { verifyUpload } from '@rotp/hub-server';
import { storeBucket } from '../storage/store-bucket';
import { hashObject } from '../storage/hash-object';
import { FIRST_ENTRY_REFUSALS } from './verify-version.constants';
import type { VerifiedVersion } from './verify-version.type';

const headOf = async (key: string, bytes: number): Promise<Uint8Array> =>
  storeBucket.readRange(key, 0, Math.min(bytes, STORE_LIMITS.manifestHeadBytes) - 1);

const factsOf = async (version: StoreVersion, bytes: number): Promise<KindFacts> => {
  const read = await readFirstEntry(await headOf(version.key, bytes));
  if (!read.ok) throw badRequest(FIRST_ENTRY_REFUSALS[read.reason]);
  const facts = factsFor(version.container, read.entry);
  if (!facts) {
    throw badRequest(`The pack's first entry must be ${CONTAINER_MANIFEST[version.container]} with a manifest the app can open.`);
  }
  return facts;
};

const verifyVersion = async (item: Pick<StoreItem, 'kind'>, version: StoreVersion): Promise<VerifiedVersion> => {
  const bytes = await verifyUpload(storeBucket, version.key, version.bytes, STORE_LIMITS.packBytes[item.kind]);
  const facts = await factsOf(version, bytes);
  const sha256 = await hashObject(storeBucket, version.key);
  if (version.sha256 !== null && sha256 !== version.sha256) {
    throw badRequest('The upload does not match the checksum declared for it.');
  }
  return { facts, sha256, bytes };
};

export { verifyVersion };
