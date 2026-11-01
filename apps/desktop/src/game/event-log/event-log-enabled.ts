/* @layer bridge-wasm @kind logic */
import { startupFlag } from '@app/launch-flags/startup-flag';

const eventLogEnabled = (): boolean => startupFlag('event-log') !== undefined;

export { eventLogEnabled };
