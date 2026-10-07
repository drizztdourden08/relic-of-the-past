/* @layer store-api @kind logic */
/** The checks a finished upload passes before it joins the review queue: the stored size is
 *  the declared one and within the kind's cap, the first entry is the container's manifest
 *  in a shape the app opens, and the bytes hash to the declared sha256. The size check
 *  removes a wrong object itself; the caller removes it on any other refusal. */
import type { FirstEntryFailure } from '../../../../shared/store/manifest/read-first-entry';
import { readFirstEntry } from '../../../../shared/store/manifest/read-first-entry';
import { factsFor } from '../../../../shared/store/manifest/facts-for';
import { CONTAINER_MANIFEST } from '../../../../shared/store/containers';
import { STORE_LIMITS } from '../../../../shared/store/limits';
import type { KindFacts, StoreItem, StoreVersion } from '../../../../shared/store/types';
import { badRequest } from '../../../hub-core/http/http-error';
import { verifyUpload } from '../../../hub-core/storage/verify-upload';
import { storeBucket } from '../storage/store-bucket';
import { hashObject } from '../storage/hash-object';

type VerifiedVersion = { facts: KindFacts; sha256: string; bytes: number };

const FIRST_ENTRY_REFUSALS: Record<FirstEntryFailure, string> = {
  'not-zip': 'The upload is not a ZIP archive.',
  truncated: 'The manifest entry is larger than the first megabyte of the pack.',
  encrypted: 'The pack is encrypted.',
  streamed: 'The first entry records its size after its data; export the pack from the app.',
  method: 'The manifest entry uses a compression the store does not read.',
  'too-large': 'The manifest is too large.',
  inflate: 'The manifest entry is damaged.',
  json: 'The manifest is not valid JSON.',
};

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
export type { VerifiedVersion };
