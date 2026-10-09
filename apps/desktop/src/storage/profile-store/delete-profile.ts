/* @layer renderer-lib @kind logic */
import { useProfilesStore } from '@drizztdourden08/brock-react';

const deleteProfile = (id: string): Promise<void> => useProfilesStore.getState().remove(id);

export { deleteProfile };
