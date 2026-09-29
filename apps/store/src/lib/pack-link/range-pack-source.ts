/* @layer store-site @kind logic */
/**
 * A pack in the bucket as a PackSource: each read is one ranged GET on the signed link, so a
 * large pack is never downloaded whole. The bucket answers 206 with the range, or 200 with
 * the whole file when it ignores the Range header, which is then cut to the range asked.
 * A read that fails once the link has lapsed (or with a 403) asks `renew` for a new link
 * and tries once more.
 */
import type { PackSource } from '@domains/packs/pack-source.type';
import type { PackLinkResponse } from '@shared/store/api-types';

type RenewLink = () => Promise<PackLinkResponse>;

/** A link this close to its end counts as lapsed. */
const EXPIRY_MARGIN_MS = 60 * 1000;
const FORBIDDEN = 403;
const READ_FAILED = 'The pack could not be read. Reload the page for a new link.';

class RangeReadError extends Error {
  readonly status: number | null;

  constructor(status: number | null) {
    super(READ_FAILED);
    this.status = status;
  }
}

const readRange = async (url: string, start: number, length: number): Promise<Uint8Array> => {
  let res: Response;
  try {
    res = await fetch(url, { headers: { Range: `bytes=${start}-${start + length - 1}` } });
  } catch {
    throw new RangeReadError(null);
  }
  if (res.status === 206) return new Uint8Array(await res.arrayBuffer());
  if (res.status === 200) return new Uint8Array(await res.arrayBuffer()).slice(start, start + length);
  throw new RangeReadError(res.status);
};

const isLapsed = (link: PackLinkResponse, cause: unknown): boolean =>
  Date.now() >= link.expiresAt - EXPIRY_MARGIN_MS || (cause instanceof RangeReadError && cause.status === FORBIDDEN);

const rangePackSource = (link: PackLinkResponse, renew?: RenewLink): PackSource => {
  let current = link;
  // Reads that fail together share one renewal.
  let renewing: Promise<PackLinkResponse> | null = null;
  const renewOnce = (next: RenewLink): Promise<PackLinkResponse> => {
    renewing ??= next().finally(() => { renewing = null; });
    return renewing;
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

export { rangePackSource, RangeReadError };
export type { RenewLink };
