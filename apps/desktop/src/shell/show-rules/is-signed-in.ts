/* @layer renderer-app @kind logic */
import type { ShowContext } from '@drizztdourden08/brock-react';

const isSignedIn = (ctx: ShowContext): boolean => ctx.flags.signedIn === true;

export { isSignedIn };
