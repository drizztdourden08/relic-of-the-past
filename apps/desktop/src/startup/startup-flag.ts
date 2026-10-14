/* @layer renderer-lib @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';

const startupFlag = (name: string): string | true | undefined => requireHostApi().startup.flags[name];

export { startupFlag };
