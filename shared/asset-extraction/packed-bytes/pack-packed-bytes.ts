/* @layer shared-asset-extraction @kind logic */
const packPackedBytes = (parts: readonly Uint8Array[]): Uint8Array => {
  if (parts.length === 0) return new Uint8Array(0);
  const offsets: number[] = [];
  let offs = 0;
  for (let i = 0; i < parts.length - 1; i++) {
    offs += parts[i].length;
    offsets.push(offs);
  }
  const wide = !(offs < 65536 && parts.length <= 8192);
  const cell = wide ? 4 : 2;
  const dataLen = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(offsets.length * cell + dataLen + 2);
  const view = new DataView(out.buffer);
  offsets.forEach((offset, i) => {
    if (wide) view.setUint32(i * 4, offset, true);
    else view.setUint16(i * 2, offset, true);
  });
  let at = offsets.length * cell;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  view.setUint16(at, (wide ? 8192 : 0) + parts.length - 1, true);
  return out;
};

export { packPackedBytes };
