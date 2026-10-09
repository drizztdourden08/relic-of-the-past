/* @layer shared-game @kind logic */
import type { PalaceMismatch } from './palace-fallback.type';
import { seenMismatches } from './seen-mismatches';

const getPalaceMismatches = (): ReadonlyMap<string, PalaceMismatch> => seenMismatches;

export { getPalaceMismatches };
