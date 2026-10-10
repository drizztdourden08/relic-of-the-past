/* @layer shared-asset-extraction @kind logic */
const u32At = (data: Uint8Array, offset: number): number =>
  (data[offset] ?? 0) | ((data[offset + 1] ?? 0) << 8) | ((data[offset + 2] ?? 0) << 16) | (((data[offset + 3] ?? 0) << 24) >>> 0);

export { u32At };
