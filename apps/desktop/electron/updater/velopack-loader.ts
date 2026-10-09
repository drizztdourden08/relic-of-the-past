/* @layer electron-main @kind logic */
import type { Velopack } from './velopack-loader.type';

let cached: Velopack | null = null;
let attempted = false;

const loadVelopack = (): Velopack | null => {
  if (attempted) return cached;
  attempted = true;
  try {
    cached = require('velopack') as Velopack;
  } catch (err) {
    console.warn('[velopack] unavailable, continuing without self-update:', err);
    cached = null;
  }
  return cached;
};

export { loadVelopack };
export type { Velopack };
