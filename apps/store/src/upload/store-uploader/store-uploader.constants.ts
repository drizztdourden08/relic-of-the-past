/* @layer store-site @kind constants */
import type { StoreItem } from '@rotp/hub-contracts';
import { STORE_LIMITS } from '@rotp/hub-contracts';
import type { UploadRunner } from '@rotp/hub-client';
import { abortVersion } from '../../api/publish-endpoints/abort-version';
import { beginVersion } from '../../api/publish-endpoints/begin-version';
import { completeVersion } from '../../api/publish-endpoints/complete-version';
import { signVersionParts } from '../../api/publish-endpoints/sign-version-parts';
import { submitVersion } from '../../api/publish-endpoints/submit-version';
import { versionParts } from '../../api/publish-endpoints/version-parts';
import { hashPack } from '../hash-pack';
import { prepareListing } from '../prepare-listing';
import { publishLabel } from '../publish-steps/publish-label';
import { publishSteps } from '../publish-steps/publish-steps';
import { publishTitle } from '../publish-steps/publish-title';
import type { PublishTarget } from '../publish-target.type';
import { itemIdOf } from './item-id-of';
import { versionOf } from './version-of';

const LARGEST_PACK = Math.max(...Object.values(STORE_LIMITS.packBytes));

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

export { LARGEST_PACK, STORE_UPLOADER };
