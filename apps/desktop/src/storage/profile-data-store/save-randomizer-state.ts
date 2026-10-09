/* @layer renderer-lib @kind logic */
import { store } from '@rotp/game-core';
import { platformFiles } from '../platform-files';

const saveRandomizerState = (p: string, placement: unknown): Promise<void> => store.saveRandomizer(platformFiles(), p, placement);

export { saveRandomizerState };
