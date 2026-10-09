/* @layer renderer-lib @kind logic */
import { store } from '@rotp/game-core';
import { platformFiles } from '../platform-files';

const loadRandomizerState = (p: string): Promise<unknown> => store.loadRandomizer(platformFiles(), p);

export { loadRandomizerState };
