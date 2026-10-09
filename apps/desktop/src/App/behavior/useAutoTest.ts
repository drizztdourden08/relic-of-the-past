/* @layer renderer-appshell @kind hook */
import { useEffect, useRef } from 'react';
import { loadStateRef } from '../../lib/game';
import { log } from '../../lib/log-bus';
import type { AutoTestDeps } from './useAutoTest.type';
import { RENDER_SETTLE_MS } from './auto-launch.constants';
import { waitForGameRunning } from './wait-for-game-running';

const useAutoTest = ({ activeProfile, loadProfileForGame }: AutoTestDeps) => {
  const didRun = useRef(false);

  useEffect(() => {
    if (!activeProfile || didRun.current) return;
    let cancelled = false;

    (async () => {
      const args = await window.api.getTestArgs();
      const autoStart = window.api.startup.autoStart;
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
        const path = await window.api.takeScreenshot(args.screenshot);
        log.app(`[AutoTest] Screenshot saved: ${path}`);
      }
    })();

    return () => { cancelled = true; };
  }, [activeProfile]);
};

export { useAutoTest };
