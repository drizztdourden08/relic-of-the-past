/* @layer store-site @kind logic */
import { BLOCK, INITIAL, LENGTH_AT, ROUND_CONSTANTS, TWO_POW_32 } from './sha256.constants';

const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));

const wordAt = (words: Uint32Array, index: number): number => {
  const word = words[index];
  if (word === undefined) throw new Error(`The hash has no word ${index}`);
  return word;
};

const compressBlock = (h: Uint32Array, w: Uint32Array, data: Uint8Array, at: number) => {
  for (let i = 0; i < 16; i += 1) {
    const j = at + i * 4;
    w[i] = ((data[j] ?? 0) << 24) | ((data[j + 1] ?? 0) << 16) | ((data[j + 2] ?? 0) << 8) | (data[j + 3] ?? 0);
  }
  for (let i = 16; i < BLOCK; i += 1) {
    const w15 = wordAt(w, i - 15);
    const w2 = wordAt(w, i - 2);
    const s0 = rotr(w15, 7) ^ rotr(w15, 18) ^ (w15 >>> 3);
    const s1 = rotr(w2, 17) ^ rotr(w2, 19) ^ (w2 >>> 10);
    w[i] = (wordAt(w, i - 16) + s0 + wordAt(w, i - 7) + s1) | 0;
  }
  let a = wordAt(h, 0), b = wordAt(h, 1), c = wordAt(h, 2), d = wordAt(h, 3);
  let e = wordAt(h, 4), f = wordAt(h, 5), g = wordAt(h, 6), hh = wordAt(h, 7);
  for (let i = 0; i < BLOCK; i += 1) {
    const t1 = (hh + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + wordAt(ROUND_CONSTANTS, i) + wordAt(w, i)) | 0;
    const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
    hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
  }
  for (const [i, value] of [a, b, c, d, e, f, g, hh].entries()) h[i] = wordAt(h, i) + value;
};

const createSha256 = () => {
  const h = new Uint32Array(INITIAL);
  const w = new Uint32Array(BLOCK);
  const pending = new Uint8Array(BLOCK);
  let pendingLength = 0;
  let total = 0;

  const compress = (data: Uint8Array, at: number) => compressBlock(h, w, data, at);

  const feed = (data: Uint8Array) => {
    let i = 0;
    if (pendingLength > 0) {
      const take = Math.min(BLOCK - pendingLength, data.length);
      pending.set(data.subarray(0, take), pendingLength);
      pendingLength += take;
      i = take;
      if (pendingLength === BLOCK) {
        compress(pending, 0);
        pendingLength = 0;
      }
    }
    for (; i + BLOCK <= data.length; i += BLOCK) compress(data, i);
    if (i < data.length) {
      pending.set(data.subarray(i), 0);
      pendingLength = data.length - i;
    }
  };

  const update = (data: Uint8Array) => {
    total += data.length;
    feed(data);
  };

  const hex = (): string => {
    const bits = total * 8;
    const pad = new Uint8Array((pendingLength < LENGTH_AT ? LENGTH_AT : LENGTH_AT + BLOCK) - pendingLength + 8);
    pad[0] = 0x80;
    const view = new DataView(pad.buffer);
    view.setUint32(pad.length - 8, Math.floor(bits / TWO_POW_32));
    view.setUint32(pad.length - 4, bits >>> 0);
    feed(pad);
    return Array.from(h, (word) => word.toString(16).padStart(8, '0')).join('');
  };

  return { update, hex };
};

export { createSha256 };
