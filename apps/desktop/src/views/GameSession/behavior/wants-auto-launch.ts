/* @layer renderer-appshell @kind logic */
import { launchesConnection } from '@app/boot/auto-launch/launches-connection';

import type { TestArgs } from '@app/ipc';

const wantsAutoLaunch = (autoState: TestArgs['autoState'], autoStart: boolean): boolean =>
  autoState !== null || autoStart || launchesConnection();

export { wantsAutoLaunch };
