/* @layer store-site @kind logic */
import type { PackSource } from '@domains/packs/pack-source.type';
import type { PackLinkResponse } from '@shared/store/api-types';
import type { RenewLink } from './range-pack-source.type';
import { readRange } from './read-range';
import { isLapsed } from './is-lapsed';

const rangePackSource = (link: PackLinkResponse, renew?: RenewLink): PackSource => {
  let current = link;
  let renewalSharedByFailedReads: Promise<PackLinkResponse> | null = null;
  const renewOnce = (next: RenewLink): Promise<PackLinkResponse> => {
    renewalSharedByFailedReads ??= next().finally(() => { renewalSharedByFailedReads = null; });
    return renewalSharedByFailedReads;
  };
  const range = async (start: number, length: number): Promise<Uint8Array> => {
    if (length <= 0) return new Uint8Array(0);
    try {
      return await readRange(current.url, start, length);
    } catch (cause) {
      if (!renew || !isLapsed(current, cause)) throw cause;
      current = await renewOnce(renew);
      return readRange(current.url, start, length);
    }
  };
  return { bytes: link.bytes, range };
};

export { rangePackSource };
