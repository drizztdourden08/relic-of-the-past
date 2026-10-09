/* @layer shared-hub @kind logic */
import type { UploadedPart } from '../uploaded-part.type';
import { partBytes } from './part-bytes';

const keptParts = (listed: readonly UploadedPart[], partSize: number, size: number, parts: number) => {
  const done = new Map<number, string>();
  for (const { part, etag, size: bytes } of listed) {
    if (part >= 1 && part <= parts && bytes === partBytes(part, partSize, size)) done.set(part, etag);
  }
  return done;
};

export { keptParts };
