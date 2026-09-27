/* @layer shared-hub @kind logic */
/**
 * One multipart upload, start to finish: begin the record, sign part URLs in batches of
 * HUB_LIMITS.partsPerSign, PUT each batch in parallel, then complete with the ETags in part
 * order. A failure after begin aborts the record. The caller supplies the begin call (which
 * route opens the record) and the PUT (how a part reaches its URL), so any site and the app
 * run the same loop.
 */
import { HUB_LIMITS } from '../limits';

type SignedParts = { urls: { part: number; url: string }[] };

/** What a begin call hands back: the part layout and the later steps bound to the record. */
type BegunMultipart<R> = {
  partSize: number;
  parts: number;
  sign: (parts: number[]) => Promise<SignedParts>;
  complete: (etags: string[]) => Promise<R>;
  /** Drops the record, which aborts the multipart upload. */
  abort: () => Promise<unknown>;
};

/** Anything cut into parts by byte range: a browser File or Blob, or a Node buffer wrapper. */
type Sliceable<P> = { size: number; slice: (start: number, end: number) => P };

type PutPart<P> = (url: string, part: P, onProgress: (loaded: number) => void) => Promise<string>;

type RunMultipartParams<P, R> = {
  source: Sliceable<P>;
  begin: () => Promise<BegunMultipart<R>>;
  put: PutPart<P>;
  /** Total bytes sent so far, across every part. */
  onProgress: (sent: number) => void;
};

const partNumbers = (first: number, last: number) =>
  Array.from({ length: last - first + 1 }, (_, i) => first + i);

const runMultipart = async <P, R>(params: RunMultipartParams<P, R>): Promise<R> => {
  const { source, begin, put, onProgress } = params;
  const begun = await begin();
  const { partSize, parts } = begun;

  const sentByPart = new Map<number, number>();
  const report = () => {
    let total = 0;
    for (const sent of sentByPart.values()) total += sent;
    onProgress(total);
  };

  try {
    const etags: string[] = new Array<string>(parts);
    for (let first = 1; first <= parts; first += HUB_LIMITS.partsPerSign) {
      const batch = partNumbers(first, Math.min(first + HUB_LIMITS.partsPerSign - 1, parts));
      const { urls } = await begun.sign(batch);
      await Promise.all(urls.map(async ({ part, url }) => {
        const piece = source.slice((part - 1) * partSize, Math.min(part * partSize, source.size));
        etags[part - 1] = await put(url, piece, (loaded) => {
          sentByPart.set(part, loaded);
          report();
        });
      }));
    }
    return await begun.complete(etags);
  } catch (error) {
    await begun.abort().catch(() => undefined);
    throw error;
  }
};

export { runMultipart };
export type { SignedParts, BegunMultipart, Sliceable, PutPart, RunMultipartParams };
