/* @layer renderer-lib @kind logic */
import * as store from '@shared/storage/profiles';
import { isAutomationLaunch } from '@app/lib/instance';
import { platformFiles } from '../platform-files';

const setLastProfile = (id: string): Promise<void> =>
  isAutomationLaunch() ? Promise.resolve() : store.setLastProfile(platformFiles(), id);

export { setLastProfile };
