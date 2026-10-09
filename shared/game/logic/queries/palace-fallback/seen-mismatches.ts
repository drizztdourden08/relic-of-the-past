/* @layer shared-game @kind logic */
import type { PalaceMismatch } from './palace-fallback.type';

const seenMismatches = new Map<string, PalaceMismatch>();

export { seenMismatches };
