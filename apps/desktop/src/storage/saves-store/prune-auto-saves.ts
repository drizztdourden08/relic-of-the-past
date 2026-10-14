/* @layer renderer-lib @kind logic */
import { autoSaves } from '../save-files';
import { platformFiles } from '../platform-files';

const pruneAutoSaves = (p: string, maxEntries?: number): Promise<void> => autoSaves.prune(platformFiles(), p, maxEntries);

export { pruneAutoSaves };
