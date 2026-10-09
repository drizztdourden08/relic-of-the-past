/* @layer renderer-lib @kind logic */
import { getAppState as getStoredAppState } from '@drizztdourden08/brock-react';

const getAppState = (): Promise<{ lastProfileId: string | null }> => getStoredAppState();

export { getAppState };
