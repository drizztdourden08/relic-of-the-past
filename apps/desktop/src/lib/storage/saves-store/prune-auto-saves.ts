/* @layer renderer-lib @kind logic */
import * as saves from '@shared/storage/saves';
import { platformFiles } from '../platform-files';

const pruneAutoSaves = (p: string, maxEntries?: number): Promise<void> => saves.pruneAutoSaves(platformFiles(), p, maxEntries);

export { pruneAutoSaves };
