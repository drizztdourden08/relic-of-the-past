/* @layer bridge-wasm @kind logic */
import { startupFlag } from '@app/launch-flags/startup-flag';

/** True when the launch carries --event-log=<path>. */
const eventLogEnabled = (): boolean => startupFlag('event-log') !== undefined;

export { eventLogEnabled };
