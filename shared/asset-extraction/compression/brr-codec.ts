/**
 * BRR (Bit Rate Reduction) audio codec — SNES DSP sample format.
 *
 * Ported from util.py decode_brr() and encode_brr_generic().
 * Must produce bit-exact output for game audio fidelity.
 */

/** BRR filter functions (matches Python kBrrFilters) */
const BRR_FILTERS = [
  (_old: number, _older: number) => 0,
  (old: number, _older: number) => old + ((-old) >> 4),
  (old: number, older: number) => old * 2 + ((-old * 3) >> 5) - older + ((older) >> 4),
  (old: number, older: number) => old * 2 + ((-old * 13) >> 6) - older + ((older * 3) >> 4),
];

/**
 * Decode a BRR-encoded audio block.
 *
 * @param getByte - Byte accessor (typically reads from a buffer)
 * @param olds - Initial filter state [old, older] (default [0, 0])
 * @returns Int16Array of decoded PCM samples
 */
export function decodeBrr(
  getByte: (offset: number) => number,
  olds: [number, number] = [0, 0],
): Int16Array {
  let ea = 0;
  const r: number[] = [];
  let [old, older] = olds;

  while (true) {
    const cmd = getByte(ea);
    const shift = cmd >>> 4;
    const filter = (cmd >>> 2) & 3;

    for (let i = 0; i < 16; i++) {
      const rawByte = getByte(ea + 1 + (i >>> 1));
      let t = ((i & 1) ? rawByte : (rawByte >>> 4)) & 0xf;
      let s: number = (t & 7) - (t & 8); // sign-extend nibble

      if (shift <= 12) {
        s = (s << shift) >> 1;
      } else {
        s = (s >> 3) << 12; // -2048 or 0
      }

      if (filter === 1) {
        s += old + ((-old) >> 4);
      } else if (filter === 2) {
        s += old * 2 + ((-old * 3) >> 5) - older + ((older) >> 4);
      } else if (filter === 3) {
        s += old * 2 + ((-old * 13) >> 6) - older + ((older * 3) >> 4);
      }

      // Saturate to 16 bits
      if (s < -0x8000) s = -0x8000;
      else if (s >= 0x7fff) s = 0x7fff;

      // Wrap to 15 bits
      s = (s & 0x3fff) - (s & 0x4000);

      older = old;
      old = s;
      r.push(s * 2);
    }

    ea += 9;
    if (cmd & 1) break;
  }

  return new Int16Array(r);
}

/** Helper for BRR encoding: compute one decoded sample */
function brrGetOne(old: number, rs: number, r: number): number {
  let s = r <= 12 ? (rs << r) >> 1 : (rs >> 3) << 12;
  s += old;
  if (s < -0x8000) s = -0x8000;
  else if (s > 0x7fff) s = 0x7fff;
  return (s & 0x3fff) - (s & 0x4000); // wrap to 15 bits
}

/**
 * Encode PCM data to BRR format.
 *
 * @param data - Int16 PCM samples (length must be multiple of 16)
 * @param brrRepeat - Loop point sample offset (0 = no loop)
 * @param olds - Initial filter state [old, older]
 * @param lossless - If true, asserts zero encoding error (throws on lossy encode)
 * @returns BRR-encoded byte array
 */
export function encodeBrr(
  data: Int16Array | number[],
  brrRepeat: number,
  olds: [number, number] = [0, 0],
  lossless = true,
): number[] {
  if (data.length % 16 !== 0) {
    throw new Error(`BRR input length ${data.length} not a multiple of 16`);
  }

  const loopEnabled = brrRepeat !== 0 ? 1 : 0;
  const loopOffset = 0;
  const result: number[] = [];
  const blkData = new Array(16).fill(0);
  const bestData = new Array(9).fill(0);
  let p = 0;
  let [bestOld, bestOlder] = olds;

  while (p < data.length) {
    let bestErr = Number.MAX_SAFE_INTEGER;
    const startOld = bestOld;
    const startOlder = bestOlder;

    // Fast path: silent block
    let allZero = true;
    for (let i = 0; i < 16; i++) {
      if (data[p + i] !== 0) { allZero = false; break; }
    }
    if (allZero) {
      result.push(loopEnabled * 2, 0, 0, 0, 0, 0, 0, 0, 0);
      p += 16;
      continue;
    }

    for (let filter = 0; filter < 4; filter++) {
      if (filter !== 0 && (p === 0 || p === loopOffset)) continue;

      for (let r = 12; r > 0; r--) {
        let blkErr = 0;
        let old = startOld;
        let older = startOlder;
        let success = true;

        for (let i = 0; i < 16; i++) {
          const s = BRR_FILTERS[filter](old, older);
          const xs = data[p + i] >> 1;
          let bestE = Number.MAX_SAFE_INTEGER;
          let bestJ = 0;
          let bestS0 = 0;

          for (const j of [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6, 7, -7, -8]) {
            const s0 = brrGetOne(s, j, r);
            const e = (xs - s0) * (xs - s0);
            if (e < bestE) {
              bestE = e;
              bestJ = j;
              bestS0 = s0;
              if (e === 0) break;
            }
          }

          if (bestE !== 0 && lossless) {
            success = false;
            break;
          }

          blkErr += bestE;
          blkData[i] = bestJ & 0xf;
          older = old;
          old = bestS0;
        }

        if (success && blkErr < bestErr) {
          bestErr = blkErr;
          bestOld = old;
          bestOlder = older;
          bestData[0] = (r << 4) | (filter << 2) | (loopEnabled << 1);
          for (let i = 0; i < 8; i++) {
            bestData[i + 1] = (blkData[i * 2] << 4) | blkData[i * 2 + 1];
          }
        }
      }
    }

    if (lossless && bestErr !== 0) {
      throw new Error(`BRR lossless encode failed at sample offset ${p}`);
    }

    result.push(...bestData);
    p += 16;
  }

  return result;
}
