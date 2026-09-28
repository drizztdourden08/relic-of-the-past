/* @layer shared-hub @kind logic */
/**
 * The part loop of one multipart upload the server has already opened: sign the parts still
 * missing in batches of HUB_LIMITS.partsPerSign, PUT each batch in parallel with up to
 * PART_TRIES tries per part, then complete with every ETag in part order. `done` holds the
 * parts already in the bucket (empty for a fresh upload, read back from the server for a
 * resumed one) and gains each part as it lands. A failure throws and leaves the record
 * open, so the caller decides between resuming and aborting. The caller supplies the
 * record's steps and the PUT, so any site and the app run the same loop.
 */
import { HUB_LIMITS } from '../limits';
import { withRetry } from './with-retry';
import type { UploadedPart } from './uploaded-part.type';

type SignedParts = { urls: { part: number; url: string }[] };

/** An open multipart record: its part layout and the steps bound to it. */
type BegunMultipart<R> = {
  partSize: number;
  parts: number;
  /** Signs a batch; `partsDone` is how many parts were already up, which the record keeps. */
  sign: (parts: number[], partsDone: number) => Promise<SignedParts>;
  complete: (etags: string[]) => Promise<R>;
  /** Drops the record, which aborts the multipart upload. */
  abort: () => Promise<unknown>;
  /** The parts the bucket already holds, for a resumed upload. */
  listParts: () => Promise<UploadedPart[]>;
};

/** Anything cut into parts by byte range: a browser File or Blob, or a Node buffer wrapper. */
type Sliceable<P> = { size: number; slice: (start: number, end: number) => P };

type PutPart<P> = (url: string, part: P, onProgress: (loaded: number) => void) => Promise<string>;

type RunMultipartParams<P, R> = {
  source: Sliceable<P>;
  begun: BegunMultipart<R>;
  /** Part number to ETag, for every part already in the bucket. */
  done: Map<number, string>;
  put: PutPart<P>;
  /** Total bytes in the bucket so far, the parts already up included. */
  onProgress: (sent: number) => void;
  /** Called once every part is up, right before complete. */
  onPartsUp?: () => void;
  signal?: AbortSignal;
};

const PART_TRIES = 3;

const partBounds = (part: number, partSize: number, size: number): [number, number] =>
  [(part - 1) * partSize, Math.min(part * partSize, size)];

const partBytes = (part: number, partSize: number, size: number) => {
  const [start, end] = partBounds(part, partSize, size);
  return end - start;
};

/** The parts a resumed upload may keep: the right number and the right size, anything else goes up again. */
const keptParts = (listed: readonly UploadedPart[], partSize: number, size: number, parts: number) => {
  const done = new Map<number, string>();
  for (const { part, etag, size: bytes } of listed) {
    if (part >= 1 && part <= parts && bytes === partBytes(part, partSize, size)) done.set(part, etag);
  }
  return done;
};

const chunk = (list: readonly number[], size: number): number[][] =>
  Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, (i + 1) * size));

const runMultipart = async <P, R>(params: RunMultipartParams<P, R>): Promise<R> => {
  const { source, begun, done, put, onProgress, onPartsUp, signal } = params;
  const { partSize, parts } = begun;
  const sizeOf = (part: number) => partBytes(part, partSize, source.size);

  let upBytes = 0;
  for (const part of done.keys()) upBytes += sizeOf(part);
  const inFlight = new Map<number, number>();
  const report = () => {
    let total = upBytes;
    for (const sent of inFlight.values()) total += sent;
    onProgress(total);
  };
  report();

  const putOne = async (part: number, url: string) => {
    const [start, end] = partBounds(part, partSize, source.size);
    const etag = await withRetry(PART_TRIES, () => {
      inFlight.set(part, 0);
      return put(url, source.slice(start, end), (loaded) => {
        inFlight.set(part, loaded);
        report();
      });
    }, signal);
    inFlight.delete(part);
    upBytes += sizeOf(part);
    done.set(part, etag);
    report();
  };

  const todo = Array.from({ length: parts }, (_, i) => i + 1).filter((part) => !done.has(part));
  for (const batch of chunk(todo, HUB_LIMITS.partsPerSign)) {
    signal?.throwIfAborted();
    const { urls } = await begun.sign(batch, done.size);
    await Promise.all(urls.map(({ part, url }) => putOne(part, url)));
  }
  signal?.throwIfAborted();
  onPartsUp?.();
  const etags = Array.from({ length: parts }, (_, i) => done.get(i + 1) ?? '');
  return begun.complete(etags);
};

export { runMultipart, keptParts };
export type { SignedParts, BegunMultipart, Sliceable, PutPart, RunMultipartParams };
