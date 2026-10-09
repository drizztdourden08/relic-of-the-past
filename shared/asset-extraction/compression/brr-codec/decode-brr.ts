/* @layer shared-asset-extraction @kind logic */
import { wrapTo15Bits } from './wrap-to-15-bits';

const signExtendNibble = (t: number): number => (t & 7) - (t & 8);

const saturateTo16Bits = (s: number): number => {
  if (s < -0x8000) return -0x8000;
  if (s >= 0x7fff) return 0x7fff;
  return s;
};

const decodeBrr = (getByte: (offset: number) => number, olds: [number, number] = [0, 0]): Int16Array => {
  let ea = 0;
  const r: number[] = [];
  let [old, older] = olds;

  while (true) {
    const cmd = getByte(ea);
    const shift = cmd >>> 4;
    const filter = (cmd >>> 2) & 3;

    for (let i = 0; i < 16; i++) {
      const rawByte = getByte(ea + 1 + (i >>> 1));
      const t = ((i & 1) ? rawByte : (rawByte >>> 4)) & 0xf;
      let s: number = signExtendNibble(t);

      if (shift <= 12) {
        s = (s << shift) >> 1;
      } else {
        s = (s >> 3) << 12;
      }

      if (filter === 1) {
        s += old + ((-old) >> 4);
      } else if (filter === 2) {
        s += old * 2 + ((-old * 3) >> 5) - older + ((older) >> 4);
      } else if (filter === 3) {
        s += old * 2 + ((-old * 13) >> 6) - older + ((older * 3) >> 4);
      }

      s = wrapTo15Bits(saturateTo16Bits(s));

      older = old;
      old = s;
      r.push(s * 2);
    }

    ea += 9;
    if (cmd & 1) break;
  }

  return new Int16Array(r);
};

export { decodeBrr };
