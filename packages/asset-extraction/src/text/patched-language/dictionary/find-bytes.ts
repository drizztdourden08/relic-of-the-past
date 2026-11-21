/* @layer shared-asset-extraction @kind logic */
const findBytes = (haystack: Uint8Array, needle: Uint8Array): number => {
  if (needle.length === 0) return -1;
  return Buffer.from(haystack.buffer, haystack.byteOffset, haystack.byteLength).indexOf(Buffer.from(needle));
};

export { findBytes };
