/* @layer renderer-appshell @kind hook */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { log } from '@app/log-bus';
import type { AutoTestDeps } from './useAutoTest.type';
import { settleAutoState } from './settle-auto-state';
import { waitForGameRunning } from './wait-for-game-running';
import { isAutoStart } from '@app/launch-flags/is-auto-start';
import { releaseScreenshot } from '@app/boot/screenshot-frames/release-screenshot';
import { pauseForScript } from '@app/boot/auto-launch/pause-for-script';
import { playScript } from '@app/boot/auto-launch/play-script';
import { prepareAutoLaunch } from '@app/boot/auto-launch/prepare-auto-launch';
import { useLaunchTask } from './useLaunchTask';
import { wantsAutoLaunch } from './wants-auto-launch';

const useAutoTest = ({ activeProfile, loadProfileForGame }: AutoTestDeps) => {
  useLaunchTask(activeProfile, async ({ isCancelled, hasRun, markRan }) => {
    if (!activeProfile) return;
    const args = await requireHostApi().getTestArgs();
    const autoStart = isAutoStart();
    if (!wantsAutoLaunch(args.autoState, autoStart)) return;
    if (isCancelled() || hasRun()) return;
    markRan();

    const prepared = await prepareAutoLaunch(activeProfile, args.autoState !== null || autoStart);
    if (prepared === null) return;
    const { script, profile } = prepared;

    log.app(`[AutoTest] args: autoState=${args.autoState}, screenshot=${args.screenshot}, autoStart=${autoStart}`);

    log.app(`[AutoTest] Starting game with profile: ${profile.name}`);
    await loadProfileForGame(profile);

    await waitForGameRunning(isCancelled);

    if (isCancelled()) return;
    pauseForScript(script);
    await settleAutoState(args);
    await playScript(script, Boolean(args.screenshot));

    if (args.screenshot) {
      log.app(`[AutoTest] Game frame drawn, releasing screenshot "${args.screenshot}"`);
      await releaseScreenshot('game');
    }
  });
};

export { useAutoTest };
