/* @layer renderer-lib @kind logic */
import * as store from '@shared/storage/profiles';
import { platformFiles } from '../platform-files';

const deleteProfile = (id: string): Promise<void> => store.deleteProfile(platformFiles(), id);

export { deleteProfile };
