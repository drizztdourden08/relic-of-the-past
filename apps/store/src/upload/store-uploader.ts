/* @layer store-site @kind logic */
/**
 * How the store uploads one pack: hashed whole (store-api needs the sha256 up front), begun
 * on the item's version route, then run through the shared multipart loop into incoming/,
 * one part PUT at a time to its presigned URL. Complete puts the version in the review
 * queue. One upload is one version, so only the first dropped file is taken. The form
 * checks each kind's own cap before this runs; the runner's cap is the largest of them.
 */
import type { StoreItem } from '@shared/store/types';
import { STORE_LIMITS } from '@shared/store/limits';
import { runMultipart } from '@shared/hub/upload/run-multipart';
import { putPart } from '@site-kit/upload/put-part';
import type { UploadRunner } from '@site-kit/upload/upload-runner.type';
import { abortVersion, beginVersion, completeVersion, signVersionParts } from '../api/publish-endpoints';
import { hashPack } from './hash-pack';
import type { VersionTarget } from './version-target.type';

const LARGEST_PACK = Math.max(...Object.values(STORE_LIMITS.packBytes));

const STORE_UPLOADER: UploadRunner<VersionTarget, StoreItem> = {
  maxBytes: LARGEST_PACK,
  labelOf: (_file, target) => `${target.itemName} ${target.semver}`,
  pick: (files) => files.slice(0, 1),
  recordIdOf: (item) => item.id,
  run: async ({ file, target, sha256, onBegun, onProgress }) => {
    const { itemId, semver, changelog, container } = target;
    const body = { semver, changelog, container, bytes: file.size, sha256: await hashPack(file, sha256) };
    const { item } = await runMultipart({
      source: file,
      begin: async () => {
        const { n, partSize, parts } = await beginVersion(itemId, body);
        onBegun(itemId, n);
        return {
          partSize,
          parts,
          sign: (batch: number[]) => signVersionParts(itemId, n, batch),
          complete: (etags: string[]) => completeVersion(itemId, n, etags),
          abort: () => abortVersion(itemId, n),
        };
      },
      put: (url, blob, onPart) => putPart({ url, blob, onProgress: onPart }),
      onProgress,
    });
    return item;
  },
};

export { STORE_UPLOADER };
