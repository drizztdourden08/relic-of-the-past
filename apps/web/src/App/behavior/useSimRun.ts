/* @layer renderer-appshell @kind hook */
/**
 * Debug hook: reacts to the --sim-run CLI flag.
 *
 * Starts the game, optionally loads a save slot, force-enables auto-skip-dialog,
 * drives the gameplay simulator headlessly to its stop condition, writes a
 * SimRunReport to debug-output/sim-run.json, then exits. Powers the in-chat
 * data-correction loop (run → read suggestions → apply → re-run).
 */

import { useEffect, useRef } from 'react';
import { subscribeGameState, loadState } from '../../lib/game';
import { createLiveGamePort, runSimulation } from '@app/lib/game/simulator';
import { pauseSramSync, resumeSramSync } from '@app/lib/game/sram-sync';
import { buildSimRunReport } from '@shared/game/simulation';

interface SimRunDeps {
  activeProfile: Profile | null;
  loadProfileForGame: (profile: Profile) => Promise<void>;
}

const waitForRunning = (): Promise<void> =>
  new Promise((resolve) => {
    const unsub = subscribeGameState((state) => {
      if (state.status === 'running') { unsub(); resolve(); }
    });
  });

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
      await waitForRunning();

      if (config.startSlot !== null) {
        const loaded = await loadState(config.startSlot);
        console.log(`[SimRun] loadState(${config.startSlot}) → ${loaded}`);
        if (!loaded) {
          await window.api.writeSimRun({ error: `loadState(${config.startSlot}) failed`, config });
          setTimeout(() => window.close(), 500);
          return;
        }
      }
      await new Promise((r) => setTimeout(r, 3000));

      const port = createLiveGamePort();
      pauseSramSync();
      port.setAutoSkipDialog(true);
      try {
        const { state, recorder, steps, reachedTarget } = await runSimulation(port, config);
        const report = buildSimRunReport(state, recorder, { config, steps, reachedTarget });
        console.log(`[SimRun] outcome=${report.outcome} reachedTarget=${reachedTarget} steps=${steps} checks=${report.verifiedChecks.length}`);
        const path = await window.api.writeSimRun(report);
        console.log(`[SimRun] Written to: ${path}`);
      } finally {
        port.setAutoSkipDialog(null);
        resumeSramSync();
      }

      setTimeout(() => window.close(), 500);
    })();
  }, [activeProfile]);
};

export { useSimRun };
