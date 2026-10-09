/* @layer renderer-lib @kind logic */
import type { PlaySession } from '@rotp/game-core';
import { store } from '@rotp/game-core';
import { platformFiles } from '../platform-files';

const listSessions = (p: string): Promise<PlaySession[]> => store.listSessions(platformFiles(), p);

export { listSessions };
