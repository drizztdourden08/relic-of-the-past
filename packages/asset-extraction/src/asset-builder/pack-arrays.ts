/* @layer shared-asset-extraction @kind logic */
const packArrays = (arr: Buffer[]): Buffer => {
  if (arr.length === 0) return Buffer.alloc(0);
  const offsets: number[] = [];
  let offs = 0;
  for (const part of arr.slice(0, -1)) {
    offs += part.length;
    offsets.push(offs);
  }
  if (offs < 65536 && arr.length <= 8192) {
    const index = Buffer.alloc(offsets.length * 2);
    for (const [i, offset] of offsets.entries()) index.writeUInt16LE(offset, i * 2);
    const trailer = Buffer.alloc(2);
    trailer.writeUInt16LE(arr.length - 1, 0);
    return Buffer.concat([index, ...arr, trailer]);
  }
  const idxBuf = Buffer.alloc(offsets.length * 4);
  for (const [i, offset] of offsets.entries()) idxBuf.writeUInt32LE(offset, i * 4);
  const trailer = Buffer.alloc(2);
  trailer.writeUInt16LE(8192 + arr.length - 1, 0);
  return Buffer.concat([idxBuf, ...arr, trailer]);
};

export { packArrays };
