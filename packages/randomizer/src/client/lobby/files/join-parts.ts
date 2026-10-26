/* @layer bridge-wasm @kind logic */
import type { LinkDownload } from './download.type';

const joinParts = (parts: LinkDownload['parts']): Uint8Array => {
  const ordered = [...parts].sort((left, right) => left.offset - right.offset);
  const total = ordered.reduce((sum, part) => sum + part.bytes.length, 0);
  const bytes = new Uint8Array(total);
  let at = 0;
  for (const part of ordered) {
    bytes.set(part.bytes, at);
    at += part.bytes.length;
  }
  return bytes;
};

export { joinParts };
