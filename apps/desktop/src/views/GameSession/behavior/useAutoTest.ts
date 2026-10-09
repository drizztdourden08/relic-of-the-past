/* @layer renderer-appshell @kind hook */
import { appApi } from '@app/ipc/app-api';
import { useEffect, useRef } from 'react';
import { loadStateRef } from '@app/game';
import { log } from '@app/log-bus';
import type { AutoTestDeps } from './useAutoTest.type';
import { RENDER_SETTLE_MS } from './auto-launch.constants';
import { waitForGameRunning } from './wait-for-game-running';
import { isAutoStart } from '@app/startup/is-auto-start';

const useAutoTest = ({ activeProfile, loadProfileForGame }: AutoTestDeps) => {
  const didRun = useRef(false);

  useEffect(() => {
    if (!activeProfile || didRun.current) return;
    let cancelled = false;

    (async () => {
      const args = await appApi().getTestArgs();
      const autoStart = isAutoStart();
      if (args.autoState === null && !args.screenshot && !autoStart) return;
      if (cancelled || didRun.current) return;
      didRun.current = true;

      log.app(`[AutoTest] args: autoState=${args.autoState}, screenshot=${args.screenshot}, autoStart=${autoStart}`);

      log.app(`[AutoTest] Starting game with profile: ${activeProfile.name}`);
      await loadProfileForGame(activeProfile);

      await waitForGameRunning(() => cancelled);

      if (cancelled) return;

      if (args.autoState !== null) {
        const kind = typeof args.autoState === 'number' ? 'quick slot' : 'manual save';
        log.app(`[AutoTest] Loading ${kind} ${args.autoState}...`);
        await loadStateRef(args.autoState);
        await new Promise((r) => setTimeout(r, RENDER_SETTLE_MS));
      } else if (args.screenshot) {
        await new Promise((r) => setTimeout(r, RENDER_SETTLE_MS));
      }

      if (args.screenshot) {
        log.app(`[AutoTest] Taking screenshot "${args.screenshot}"...`);
        const path = await appApi().finishAutomation(args.screenshot);
        log.app(`[AutoTest] Screenshot saved: ${path}`);
      }
    })();

    return () => { cancelled = true; };
  }, [activeProfile]);
};

export { useAutoTest };
