/* @layer renderer-lib @kind logic */
import { liveSettingsNow } from '@app/game/live-settings';
import { isMobileHost } from '@app/platform/is-mobile-host';

const touchPadAllowed = (): boolean => isMobileHost() && liveSettingsNow()?.touchControls.enabled === true;

export { touchPadAllowed };
