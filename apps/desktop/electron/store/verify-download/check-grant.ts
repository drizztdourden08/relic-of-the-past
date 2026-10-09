/* @layer electron-main @kind logic */
import type { DownloadResponse } from '@shared/store/api-types';
import { KIND_CONTAINER } from '@shared/store/containers';
import { STORE_LIMITS } from '@shared/store/limits';
import { isInstalledOrigin } from '../installed-registry';

const checkGrant = (grant: DownloadResponse, itemId: string): void => {
  if (grant.itemId !== itemId) throw new Error('The Hookshop answered for a different item.');
  if (KIND_CONTAINER[grant.kind] !== grant.container) throw new Error('The Hookshop answered with an unknown kind of pack.');
  if (!(grant.bytes > 0) || grant.bytes > STORE_LIMITS.packBytes[grant.kind]) {
    throw new Error('The pack is larger than the Hookshop allows.');
  }
  if (!grant.url.startsWith('https://')) throw new Error('The Hookshop answered with a download that is not secure.');
  if (!isInstalledOrigin({ name: grant.name, author: grant.author, license: grant.license })) {
    throw new Error('The Hookshop answered without the pack\'s author or licence.');
  }
};

export { checkGrant };
