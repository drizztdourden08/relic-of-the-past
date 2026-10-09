/* @layer shared-game @kind logic */
import { seenMismatches } from './seen-mismatches';

const clearPalaceMismatches = (): void => { seenMismatches.clear(); };

export { clearPalaceMismatches };
