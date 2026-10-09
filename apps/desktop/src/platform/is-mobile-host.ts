/* @layer renderer-other @kind logic */
import { detectHost } from '@drizztdourden08/brock-core';

const isMobileHost = (): boolean => detectHost() === 'capacitor';

export { isMobileHost };
