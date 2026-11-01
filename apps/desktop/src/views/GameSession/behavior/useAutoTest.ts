/* @layer renderer-appshell @kind hook */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { useEffect, useRef } from 'react';
import { loadStateRef } from '@app/game';
import { log } from '@app/log-bus';
import type { AutoTestDeps } from './useAutoTest.type';
import { RENDER_SETTLE_MS } from './auto-launch.constants';
import { waitForGameRunning } from './wait-for-game-running';
import { isAutoStart } from '@app/launch-flags/is-auto-start';
import { apConnectFlag } from '@app/launch-flags/ap-connect/ap-connect';
import { lobbyJoinFlag } from '@app/launch-flags/lobby-join/lobby-join';
import { releaseScreenshot } from '@app/boot/screenshot-frames/release-screenshot';
import { prepareAutoLaunch } from '@app/boot/auto-launch/prepare-auto-launch';
import { runInputScript } from '@app/boot/input-script/run-input-script';
import { wasmSetPaused } from '@rotp/game-core';

const useAutoTest = ({ activeProfile, loadProfileForGame }: AutoTestDeps) => {
  const didRun = useRef(false);

  useEffect(() => {
    if (!activeProfile || didRun.current) return;
    const abort = new AbortController();
    const isCancelled = () => abort.signal.aborted;

    void (async () => {
      const args = await requireHostApi().getTestArgs();
      const autoStart = isAutoStart();
      const launchesConnection = apConnectFlag().kind !== 'absent' || lobbyJoinFlag().kind !== 'absent';
      if (args.autoState === null && !autoStart && !launchesConnection) return;
      if (isCancelled() || didRun.current) return;
      didRun.current = true;

      const script = await prepareAutoLaunch(activeProfile, args.autoState !== null || autoStart);
      if (script === null) return;

      log.app(`[AutoTest] args: autoState=${args.autoState}, screenshot=${args.screenshot}, autoStart=${autoStart}`);

      log.app(`[AutoTest] Starting game with profile: ${activeProfile.name}`);
      await loadProfileForGame(activeProfile);

      await waitForGameRunning(isCancelled);

      if (isCancelled()) return;
      if (script.kind === 'ready') wasmSetPaused(true);

      if (args.autoState !== null) {
        const kind = typeof args.autoState === 'number' ? 'quick slot' : 'manual save';
        log.app(`[AutoTest] Loading ${kind} ${args.autoState}...`);
        await loadStateRef(args.autoState);
        await new Promise((r) => setTimeout(r, RENDER_SETTLE_MS));
      } else if (args.screenshot) {
        await new Promise((r) => setTimeout(r, RENDER_SETTLE_MS));
      }

      if (script.kind === 'ready') await runInputScript(script.steps);
      if (script.kind === 'ready' && !args.screenshot) wasmSetPaused(false);

      if (args.screenshot) {
        log.app(`[AutoTest] Game frame drawn, releasing screenshot "${args.screenshot}"`);
        await releaseScreenshot('game');
      }
    })();

    return () => abort.abort();
  }, [activeProfile]);
};

export { useAutoTest };
