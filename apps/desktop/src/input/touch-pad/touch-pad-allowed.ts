/* @layer renderer-lib @kind logic */
import { isMobileHost } from '@app/platform/is-mobile-host';

const touchPadAllowed = (): boolean => isMobileHost();

export { touchPadAllowed };
