/* @layer renderer-lib @kind logic */
import type { PlaySession } from '@rotp/game-core';
import { store } from '@rotp/game-core';
import { platformFiles } from '../platform-files';

const saveSession = (p: string, session: PlaySession): Promise<void> => store.saveSession(platformFiles(), p, session);

export { saveSession };
