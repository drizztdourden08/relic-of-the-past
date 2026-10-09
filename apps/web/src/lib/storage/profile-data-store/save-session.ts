/* @layer renderer-lib @kind logic */
import type { PlaySession } from '@shared/types/session';
import * as store from '@shared/storage/profile-data';
import { platformFiles } from '../platform-files';

const saveSession = (p: string, session: PlaySession): Promise<void> => store.saveSession(platformFiles(), p, session);

export { saveSession };
