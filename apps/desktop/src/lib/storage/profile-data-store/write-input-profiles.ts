/* @layer renderer-lib @kind logic */
import * as store from '@shared/storage/profile-data';
import { platformFiles } from '../platform-files';

const writeInputProfiles = (p: string, profiles: unknown[]): Promise<void> => store.writeInputProfiles(platformFiles(), p, profiles);

export { writeInputProfiles };
