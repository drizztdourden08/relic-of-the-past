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
import { subscribeGameState, loadState, loadStateRef, wasmGetViewportInfo } from '../../lib/game';
import { linkStartTile } from '@shared/game/navigation/link-start-tile';
import { createLiveGamePort, runSimulation, floodOverworldScreen, probeRoom, scanRoomsForSprite } from '@app/lib/game/simulator';
import { pauseSramSync, resumeSramSync } from '@app/lib/game/sram-sync';
import { overworldOrigin } from '@app/lib/game/flood';
import { buildSimRunReport, formatEndSummary } from '@shared/game/simulation';

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

      if (config.stateName !== null) {
        const ok = await loadStateRef(config.stateName);
        console.log(`[SimRun] loadStateRef(${config.stateName}) → ${ok}`);
        await new Promise((r) => setTimeout(r, 2000));
      } else if (config.startSlot !== null) {
        const loaded = await loadState(config.startSlot);
        console.log(`[SimRun] loadState(${config.startSlot}) → ${loaded}`);
        if (!loaded) {
          await window.api.writeSimRun({ error: `loadState(${config.startSlot}) failed`, config });
          setTimeout(() => window.close(), 500);
          return;
        }
      }
      await new Promise((r) => setTimeout(r, 3000));

      // Diagnostic: addressable flood of one screen — validates the sim's flood
      // matches the normal in-game flood without running the whole simulation.
      if (config.floodScreen !== null) {
        // Seed from the live player tile only when the game is actually standing on
        // the flooded overworld screen; otherwise flood seedless (remote screen).
        const vp = wasmGetViewportInfo();
        const liveScreen = vp ? ((((vp.linkY >> 9) & 7) << 3) | ((vp.linkX >> 9) & 7)) : -1;
        const startPos = config.probeTile ?? (vp && liveScreen === config.floodScreen
          ? linkStartTile({
              linkX: vp.linkX, linkY: vp.linkY,
              screenWorldX: overworldOrigin(config.floodScreen).x,
              screenWorldY: overworldOrigin(config.floodScreen).y,
            })
          : undefined);
        const items = ['lift.1', ...(config.probeItems ?? [])] as Parameters<typeof floodOverworldScreen>[2];
        const flood = floodOverworldScreen(config.floodScreen, startPos, items);
        console.log(`[SimRun] flood seed=${JSON.stringify(startPos)} liveScreen=0x${liveScreen.toString(16)}`);
        console.log(`[SimRun] flood screen 0x${config.floodScreen.toString(16)}: ${JSON.stringify(flood && { reachable: flood.reachableCount, total: flood.totalTiles, entrances: flood.entranceCount, edges: flood.edgeCount, ledges: flood.ledgeCount })}`);
        await window.api.writeSimRun({ floodScreen: config.floodScreen, items, flood });
        setTimeout(() => window.close(), 500);
        return;
      }

      // Diagnostic: which rooms hold a given sprite? A dataset room index that
      // points at the wrong cave is invisible until you ask the game itself.
      if (config.scanSprite !== null) {
        const hits = scanRoomsForSprite(config.scanSprite);
        console.log(`[SimRun] sprite 0x${config.scanSprite.toString(16)} in ${hits.length} rooms`);
        await window.api.writeSimRun({ scanSprite: config.scanSprite, hits });
        setTimeout(() => window.close(), 500);
        return;
      }

      // Diagnostic: why does one room read as a dead end? Dumps the tables that
      // decide it (entrance seeds, fall holes, exit-screen entry, detected exits).
      if (config.probeRoom !== null) {
        const probe = probeRoom(config.probeRoom, config.probeTile ?? undefined,
          ['lift.1', ...(config.probeItems ?? [])] as Parameters<typeof probeRoom>[2]);
        console.log(`[SimRun] room 0x${config.probeRoom.toString(16)}: ${JSON.stringify(probe)}`);
        await window.api.writeSimRun({ probe });
        setTimeout(() => window.close(), 500);
        return;
      }

      const port = createLiveGamePort();
      pauseSramSync();
      port.setAutoSkipDialog(true);
      try {
        const { state, recorder, steps, reachedTarget, screenFloods, visits, path, checks, tally, endSummary } = await runSimulation(port, config);
        const report = buildSimRunReport(state, recorder, { config, steps, reachedTarget });
        for (const line of formatEndSummary(endSummary)) console.log(`[SimRun] END ${line}`);
        console.log(`[SimRun] outcome=${report.outcome} reachedTarget=${reachedTarget} steps=${steps} checks=${report.verifiedChecks.length} floods=${screenFloods.length}`);
        const inventory = {
          items: [...state.inventory].sort(),
          keys: Object.fromEntries([...state.keys].filter(([, n]) => n > 0)),
          bigKeys: [...state.bigKeys].sort(),
          events: [...state.events].sort(),
        };
        const outPath = await window.api.writeSimRun({ ...report, screenFloods, visits, path, checks, inventory, tally, endSummary });
        console.log(`[SimRun] Written to: ${outPath}`);
      } finally {
        port.setAutoSkipDialog(null);
        resumeSramSync();
      }

      setTimeout(() => window.close(), 500);
    })();
  }, [activeProfile]);
};

export { useSimRun };
