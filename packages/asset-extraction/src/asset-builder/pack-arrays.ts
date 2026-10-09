/* @layer shared-asset-extraction @kind logic */
const packArrays = (arr: Buffer[]): Buffer => {
  if (arr.length === 0) return Buffer.alloc(0);
  const offsets: number[] = [];
  let offs = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    offs += arr[i].length;
    offsets.push(offs);
  }
  if (offs < 65536 && arr.length <= 8192) {
    const hdr = Buffer.alloc(offsets.length * 2 + 2);
    for (let i = 0; i < offsets.length; i++) hdr.writeUInt16LE(offsets[i], i * 2);
    hdr.writeUInt16LE(arr.length - 1, offsets.length * 2);
    return Buffer.concat([Buffer.alloc(offsets.length * 2, 0).fill((() => { const b = Buffer.alloc(offsets.length * 2); for (let i = 0; i < offsets.length; i++) b.writeUInt16LE(offsets[i], i * 2); return b; })(), 0, offsets.length * 2), ...arr, (() => { const b = Buffer.alloc(2); b.writeUInt16LE(arr.length - 1, 0); return b; })()]);
  } else {
    const idxBuf = Buffer.alloc(offsets.length * 4);
    for (let i = 0; i < offsets.length; i++) idxBuf.writeUInt32LE(offsets[i], i * 4);
    const trailer = Buffer.alloc(2);
    trailer.writeUInt16LE(8192 + arr.length - 1, 0);
    return Buffer.concat([idxBuf, ...arr, trailer]);
  }
};

export { packArrays };
