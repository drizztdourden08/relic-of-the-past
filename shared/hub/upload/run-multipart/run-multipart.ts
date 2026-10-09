/* @layer shared-hub @kind logic */
import { HUB_LIMITS } from '../../limits';
import { withRetry } from '../with-retry';
import { batchesOf } from './batches-of';
import { partBounds } from './part-bounds';
import { partBytes } from './part-bytes';
import { PART_TRIES } from './run-multipart.constants';
import type { RunMultipartParams } from './run-multipart.type';

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
  for (const batch of batchesOf(todo, HUB_LIMITS.partsPerSign)) {
    signal?.throwIfAborted();
    const { urls } = await begun.sign(batch, done.size);
    await Promise.all(urls.map(({ part, url }) => putOne(part, url)));
  }
  signal?.throwIfAborted();
  onPartsUp?.();
  const etags = Array.from({ length: parts }, (_, i) => done.get(i + 1) ?? '');
  return begun.complete(etags);
};

export { runMultipart };
