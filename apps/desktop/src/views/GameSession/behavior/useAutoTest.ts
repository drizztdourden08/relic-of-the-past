/* @layer renderer-appshell @kind hook */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { log } from '@app/log-bus';
import type { AutoTestDeps } from './useAutoTest.type';
import { waitForGameRunning } from './wait-for-game-running';
import { isAutoStart } from '@app/launch-flags/is-auto-start';
import { settleAutoTest } from './settle-auto-test';
import { useLaunchTask } from './useLaunchTask';

const useAutoTest = ({ activeProfile, loadProfileForGame }: AutoTestDeps) => {
  useLaunchTask(activeProfile, async ({ isCancelled, hasRun, markRan }) => {
    if (!activeProfile) return;
    const args = await requireHostApi().getTestArgs();
    const autoStart = isAutoStart();
    if (args.autoState === null && !autoStart) return;
    if (isCancelled() || hasRun()) return;
    markRan();

    log.app(`[AutoTest] args: autoState=${args.autoState}, screenshot=${args.screenshot}, autoStart=${autoStart}`);

    log.app(`[AutoTest] Starting game with profile: ${activeProfile.name}`);
    await loadProfileForGame(activeProfile);

    await waitForGameRunning(isCancelled);

    if (isCancelled()) return;

    await settleAutoTest(args);
  });
};

export { useAutoTest };
