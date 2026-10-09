/* @layer renderer-lib @kind logic */
import { isAutomationLaunch, setLastProfile as setStoredLastProfile } from '@drizztdourden08/brock-react';

const setLastProfile = (id: string): Promise<void> => (isAutomationLaunch() ? Promise.resolve() : setStoredLastProfile(id));

export { setLastProfile };
