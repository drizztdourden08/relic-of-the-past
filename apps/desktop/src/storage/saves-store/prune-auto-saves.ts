/* @layer renderer-lib @kind logic */
import { saves } from '@rotp/game-core';
import { platformFiles } from '../platform-files';

const pruneAutoSaves = (p: string, maxEntries?: number): Promise<void> => saves.pruneAutoSaves(platformFiles(), p, maxEntries);

export { pruneAutoSaves };
