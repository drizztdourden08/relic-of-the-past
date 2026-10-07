/* @layer store-site @kind logic */
/**
 * How the store publishes: the listing steps first (prepare-listing), then the pack, hashed
 * whole (store-api needs the sha256 up front), begun on the item's version route and run
 * through the shared multipart loop into incoming/. Complete leaves the version ready, and
 * "Send for review" is the author's own step after it. One publish takes one pack. The form
 * checks each kind's own cap before this runs; the runner's cap is the largest of them.
 */
import type { StoreItem } from '@shared/store/types';
import { STORE_LIMITS } from '@shared/store/limits';
import type { UploadRunner } from '@site-kit/upload/upload-runner.type';
import {
  abortVersion,
  beginVersion,
  completeVersion,
  signVersionParts,
  submitVersion,
  versionParts,
} from '../api/publish-endpoints';
import { hashPack } from './hash-pack';
import { prepareListing } from './prepare-listing';
import { publishLabel, publishSteps, publishTitle } from './publish-steps';
import type { PublishTarget } from './publish-target.type';

const LARGEST_PACK = Math.max(...Object.values(STORE_LIMITS.packBytes));

const itemIdOf = (target: PublishTarget): string => {
  if (!target.itemId) throw new Error('The listing was not created.');
  return target.itemId;
};

const versionOf = (n: number | null): number => {
  if (n === null) throw new Error('The version has no number.');
  return n;
};

const STORE_UPLOADER: UploadRunner<PublishTarget, StoreItem> = {
  site: 'store',
  maxBytes: LARGEST_PACK,
  pick: (files) => files.slice(0, 1),
  labelOf: (target, _file, n) => publishLabel(target, n),
  titleOf: (target) => publishTitle(target),
  stepsOf: (target) => publishSteps(target),
  prepare: prepareListing,
  hash: (file) => hashPack(file),
  begin: async (target, file, sha256) => {
    const itemId = itemIdOf(target);
    const pack = target.pack;
    if (!pack || !sha256) throw new Error('This publish has no pack.');
    const { n, partSize, parts } = await beginVersion(itemId, { ...pack, bytes: file.size, sha256 });
    return { recordId: itemId, n, partSize, parts };
  },
  bind: (_target, resume) => {
    const { recordId: itemId, partSize, parts } = resume;
    const n = versionOf(resume.n);
    return {
      partSize,
      parts,
      sign: (batch, partsDone) => signVersionParts(itemId, n, batch, partsDone),
      complete: async (etags) => (await completeVersion(itemId, n, etags)).item,
      abort: () => abortVersion(itemId, n),
      listParts: async () => (await versionParts(itemId, n)).parts,
    };
  },
  followUp: {
    label: 'Send for review',
    doneLabel: 'Sent for review',
    run: async (_target, resume) => (await submitVersion(resume.recordId, versionOf(resume.n))).item,
  },
};

export { STORE_UPLOADER };
