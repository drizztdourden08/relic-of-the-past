/* @layer electron-main @kind logic */
import type { Koffi } from './koffi-loader.type';

let cached: Koffi | null = null;
let attempted = false;

const loadKoffi = (): Koffi | null => {
  if (attempted) return cached;
  attempted = true;
  try {
    cached = require('koffi') as Koffi;
  } catch {
    cached = null;
  }
  return cached;
};

export { loadKoffi };
export type { Koffi };
