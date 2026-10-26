/* @layer renderer-appshell @kind hook */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { useEffect, useRef } from 'react';
import { loadStateRef } from '@app/game';
import { log } from '@app/log-bus';
import type { AutoTestDeps } from './useAutoTest.type';
import { RENDER_SETTLE_MS } from './auto-launch.constants';
import { waitForGameRunning } from './wait-for-game-running';
import { isAutoStart } from '@app/launch-flags/is-auto-start';
import { screenshotHold } from '@app/boot/screenshot-hold';

const useAutoTest = ({ activeProfile, loadProfileForGame }: AutoTestDeps) => {
  const didRun = useRef(false);

  useEffect(() => {
    if (!activeProfile || didRun.current) return;
    const abort = new AbortController();
    const isCancelled = () => abort.signal.aborted;

    void (async () => {
      const args = await requireHostApi().getTestArgs();
      const autoStart = isAutoStart();
      if (args.autoState === null && !autoStart) return;
      if (isCancelled() || didRun.current) return;
      didRun.current = true;

      log.app(`[AutoTest] args: autoState=${args.autoState}, screenshot=${args.screenshot}, autoStart=${autoStart}`);

      log.app(`[AutoTest] Starting game with profile: ${activeProfile.name}`);
      await loadProfileForGame(activeProfile);

      await waitForGameRunning(isCancelled);

      if (isCancelled()) return;

      if (args.autoState !== null) {
        const kind = typeof args.autoState === 'number' ? 'quick slot' : 'manual save';
        log.app(`[AutoTest] Loading ${kind} ${args.autoState}...`);
        await loadStateRef(args.autoState);
        await new Promise((r) => setTimeout(r, RENDER_SETTLE_MS));
      } else if (args.screenshot) {
        await new Promise((r) => setTimeout(r, RENDER_SETTLE_MS));
      }

      if (args.screenshot) {
        log.app(`[AutoTest] Game frame drawn, releasing screenshot "${args.screenshot}"`);
        screenshotHold.release();
      }
    })();

    return () => abort.abort();
  }, [activeProfile]);
};

export { useAutoTest };
