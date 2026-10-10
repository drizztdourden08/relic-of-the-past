/* @layer shared-asset-extraction @kind logic */
import { wrapTo15Bits } from './wrap-to-15-bits';

const brrGetOne = (old: number, rs: number, r: number): number => {
  let s = r <= 12 ? (rs << r) >> 1 : (rs >> 3) << 12;
  s += old;
  if (s < -0x8000) s = -0x8000;
  else if (s > 0x7fff) s = 0x7fff;
  return wrapTo15Bits(s);
};

export { brrGetOne };
