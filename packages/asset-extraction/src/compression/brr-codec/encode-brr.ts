/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import { wrapTo15Bits } from './wrap-to-15-bits';

const brrFilters = [
  (_old: number, _older: number) => 0,
  (old: number, _older: number) => old + ((-old) >> 4),
  (old: number, older: number) => old * 2 + ((-old * 3) >> 5) - older + ((older) >> 4),
  (old: number, older: number) => old * 2 + ((-old * 13) >> 6) - older + ((older * 3) >> 4),
];

const brrGetOne = (old: number, rs: number, r: number): number => {
  let s = r <= 12 ? (rs << r) >> 1 : (rs >> 3) << 12;
  s += old;
  if (s < -0x8000) s = -0x8000;
  else if (s > 0x7fff) s = 0x7fff;
  return wrapTo15Bits(s);
};

const isSilentBlock = (data: Int16Array | number[], p: number): boolean => {
  for (let i = 0; i < 16; i++) {
    if (data[p + i] !== 0) return false;
  }
  return true;
};

const encodeBrr = (data: Int16Array | number[], brrRepeat: number, olds: [number, number] = [0, 0], lossless = true): number[] => {
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

    if (isSilentBlock(data, p)) {
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
          const s = itemAt(brrFilters, filter, 'BRR filter')(old, older);
          const xs = (data[p + i] ?? 0) >> 1;
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
};

export { encodeBrr };
