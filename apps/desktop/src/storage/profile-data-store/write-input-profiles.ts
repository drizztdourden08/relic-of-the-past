/* @layer renderer-lib @kind logic */
import { store } from '@rotp/game-core';
import { platformFiles } from '../platform-files';

const writeInputProfiles = (p: string, profiles: unknown[]): Promise<void> => store.writeInputProfiles(platformFiles(), p, profiles);

export { writeInputProfiles };
