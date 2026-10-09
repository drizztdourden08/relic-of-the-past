/* @layer renderer-lib @kind logic */
import { store } from '@rotp/game-core';
import { platformFiles } from '../platform-files';

const readInputProfiles = (p: string): Promise<unknown[]> => store.readInputProfiles(platformFiles(), p);

export { readInputProfiles };
