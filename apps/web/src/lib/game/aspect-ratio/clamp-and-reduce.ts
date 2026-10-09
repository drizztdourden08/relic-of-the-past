/* @layer bridge-wasm @kind logic */
import type { RatioPair } from './aspect-ratio.type';
import { MAX_ASPECT, MIN_ASPECT } from './aspect-ratio.constants';

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

const clampAndReduce = (longPx: number, shortPx: number): RatioPair => {
  let long = longPx;
  let short = shortPx;
  const ratio = long / short;
  if (ratio > MAX_ASPECT) {
    long = Math.round(MAX_ASPECT * short);
  } else if (ratio < MIN_ASPECT) {
    short = Math.round(long / MIN_ASPECT);
  }
  const g = gcd(long, short) || 1;
  return { w: long / g, h: short / g };
};

export { clampAndReduce };
