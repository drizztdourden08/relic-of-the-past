/* @layer electron-main @kind logic */
/**
 * Lazy, cached Velopack load.
 *
 * Required at runtime instead of imported statically. Velopack loads its native module
 * the moment the package is required (its index lists the loader's keys, which loads the
 * binding), and the prebuilt Linux module needs a recent glibc (2.39 as of 1.2.161). A
 * static import therefore throws before any of our code runs, and the app never starts
 * on older distros. Loaded here, a failure degrades to "no self-update" instead.
 */
import type * as VelopackModule from 'velopack';

type Velopack = typeof VelopackModule;

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
