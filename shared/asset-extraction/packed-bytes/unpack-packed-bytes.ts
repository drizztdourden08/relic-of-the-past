/* @layer shared-asset-extraction @kind logic */
const unpackPackedBytes = (data: Uint8Array): Uint8Array[] => {
  if (data.length < 2) return [];
  const end = data.length - 2;
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let mx = view.getUint16(end, true);
  const wide = mx >= 8192;
  if (wide) mx -= 8192;
  const cell = wide ? 4 : 2;
  if (mx * cell > end) return [];
  const offsetAt = (i: number): number =>
    wide ? view.getUint32(i * 4, true) : view.getUint16(i * 2, true);
  const parts: Uint8Array[] = [];
  for (let i = 0; i <= mx; i++) {
    const left = i === 0 ? mx * cell : mx * cell + offsetAt(i - 1);
    const right = i === mx ? end : mx * cell + offsetAt(i);
    if (left > right || right > end) return [];
    parts.push(data.subarray(left, right));
  }
  return parts;
};

export { unpackPackedBytes };
