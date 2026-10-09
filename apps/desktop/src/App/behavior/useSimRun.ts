/* @layer renderer-appshell @kind hook */
import { useEffect, useRef } from 'react';
import { loadState, loadStateRef } from '../../lib/game';
import { createLiveGamePort } from '@app/lib/game/simulator';
import { pauseSramSync, resumeSramSync } from '@app/lib/game/sram-sync';
import type { SimRunDeps } from './useSimRun.type';
import { FEATURE_LATCH_MS, SIM_START_SETTLE_MS } from './sim-run.constants';
import { EXIT_DELAY_MS, RENDER_SETTLE_MS } from './auto-launch.constants';
import { waitForGameRunning } from './wait-for-game-running';
import { runSimDiagnostic } from './run-sim-diagnostic';
import { runFullSimulation } from './run-full-simulation';

const neverCancelled = (): boolean => false;

const useSimRun = ({ activeProfile, loadProfileForGame }: SimRunDeps) => {
  const didRun = useRef(false);

  useEffect(() => {
    if (!activeProfile || didRun.current) return;

    (async () => {
      const config = await window.api.getSimRunConfig();
      if (config === null) return;
      didRun.current = true;

      console.log(`[SimRun] Starting game for profile: ${activeProfile.name}`);
      await loadProfileForGame(activeProfile);
      await waitForGameRunning(neverCancelled);

      if (config.stateName !== null) {
        const ok = await loadStateRef(config.stateName);
        console.log(`[SimRun] loadStateRef(${config.stateName}) → ${ok}`);
        await new Promise((r) => setTimeout(r, RENDER_SETTLE_MS));
      } else if (config.startSlot !== null) {
        const loaded = await loadState(config.startSlot);
        console.log(`[SimRun] loadState(${config.startSlot}) → ${loaded}`);
        if (!loaded) {
          await window.api.writeSimRun({ error: `loadState(${config.startSlot}) failed`, config });
          setTimeout(() => window.close(), EXIT_DELAY_MS);
          return;
        }
      }
      await new Promise((r) => setTimeout(r, SIM_START_SETTLE_MS));

      const port = createLiveGamePort();
      pauseSramSync();
      port.setSimulatorSupport(true);
      port.setAutoSkipDialog(true);
      port.setDeveloperTools(true);
      await new Promise((r) => setTimeout(r, FEATURE_LATCH_MS));
      try {
        const diagnostic = runSimDiagnostic(config);
        if (diagnostic !== null) {
          await window.api.writeSimRun(diagnostic);
          setTimeout(() => window.close(), EXIT_DELAY_MS);
          return;
        }
        await runFullSimulation(port, config);
      } finally {
        port.setAutoSkipDialog(null);
        port.setDeveloperTools(null);
        port.setSimulatorSupport(false);
        resumeSramSync();
      }

      setTimeout(() => window.close(), EXIT_DELAY_MS);
    })();
  }, [activeProfile]);
};

export { useSimRun };
