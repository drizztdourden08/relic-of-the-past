/* @layer store-site @kind logic */
import type { PackLinkResponse } from '@rotp/hub-contracts';
import { FORBIDDEN, LAPSED_WHEN_THIS_CLOSE_TO_EXPIRY_MS } from './range-pack-source.constants';
import { RangeReadError } from './range-read-error';

const isLapsed = (link: PackLinkResponse, cause: unknown): boolean =>
  Date.now() >= link.expiresAt - LAPSED_WHEN_THIS_CLOSE_TO_EXPIRY_MS
  || (cause instanceof RangeReadError && cause.status === FORBIDDEN);

export { isLapsed };
