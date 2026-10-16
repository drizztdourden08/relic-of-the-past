/* @layer renderer-app @kind logic */
import { liveSettingsNow } from '@app/game/live-settings';

const debugLoggingOn = (): boolean => liveSettingsNow()?.allowDebugLogging === true;

export { debugLoggingOn };
