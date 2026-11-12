/* @layer renderer-lib @kind logic */
import { liveSettingsNow } from '@app/game/live-settings';
import { isMobileHost } from '@app/platform/is-mobile-host';

/** The touch pad reaches the game only while touch controls are on and the host is a phone or tablet. */
const touchPadAllowed = (): boolean => isMobileHost() && liveSettingsNow()?.touchControls?.enabled === true;

export { touchPadAllowed };
