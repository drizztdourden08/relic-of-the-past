/* @layer renderer-other @kind logic */
import { getPlatform } from '@drizztdourden08/brock-react';

const isMobileHost = (): boolean => getPlatform().info.formFactor === 'mobile';

export { isMobileHost };
