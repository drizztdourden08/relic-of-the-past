/* @layer renderer-lib @kind logic */
import type { PlaySession } from '@shared/types/session';
import * as store from '@shared/storage/profile-data';
import { platformFiles } from '../platform-files';

const listSessions = (p: string): Promise<PlaySession[]> => store.listSessions(platformFiles(), p);

export { listSessions };
