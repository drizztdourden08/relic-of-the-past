/* @layer shared-asset-extraction @kind logic */
const u32At = (data: Uint8Array, offset: number): number =>
  data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16) | ((data[offset + 3] << 24) >>> 0);

export { u32At };
