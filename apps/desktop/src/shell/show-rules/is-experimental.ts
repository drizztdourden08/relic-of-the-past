/* @layer renderer-app @kind logic */
import type { ShowContext } from '@drizztdourden08/brock-react';

const isExperimental = ({ flags }: ShowContext): boolean => flags.experimental === true;

export { isExperimental };
